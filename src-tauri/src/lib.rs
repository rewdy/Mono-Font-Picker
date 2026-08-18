use std::collections::BTreeMap;
use std::sync::OnceLock;

use serde::Serialize;

#[derive(Serialize, Clone)]
struct FontFace {
    weight: u16,
    italic: bool,
    style_name: String,
    post_script_name: String,
}

#[derive(Serialize, Clone)]
struct FontFamily {
    family: String,
    faces: Vec<FontFace>,
}

// Detect monospace by measuring glyph advances. Many genuinely monospaced fonts
// ship without the OpenType `post.isFixedPitch` flag that `fontdb` reads, so the
// flag alone under-reports. If a spread of representative glyphs all share one
// non-zero advance width, the face is fixed-pitch.
fn is_monospace_by_metrics(db: &fontdb::Database, id: fontdb::ID) -> bool {
    db.with_face_data(id, |data, index| {
        let face = match ttf_parser::Face::parse(data, index) {
            Ok(f) => f,
            Err(_) => return false,
        };

        let samples = ['i', 'l', 'M', 'W', 'm', '0', 'x', ' ', '@'];
        let mut widths = Vec::new();
        for ch in samples {
            if let Some(gid) = face.glyph_index(ch) {
                if let Some(adv) = face.glyph_hor_advance(gid) {
                    widths.push(adv);
                }
            }
        }

        // Require enough sampled glyphs to trust the verdict.
        if widths.len() < 4 {
            return false;
        }
        let first = widths[0];
        first != 0 && widths.iter().all(|&w| w == first)
    })
    .unwrap_or(false)
}

fn compute_monospace_fonts() -> Vec<FontFamily> {
    let mut db = fontdb::Database::new();
    db.load_system_fonts();

    let mut families: BTreeMap<String, Vec<FontFace>> = BTreeMap::new();

    for face in db.faces() {
        let is_mono = face.monospaced || is_monospace_by_metrics(&db, face.id);
        if !is_mono {
            continue;
        }

        let family = match face.families.first() {
            Some((name, _)) => name.clone(),
            None => continue,
        };

        // Skip hidden/system-internal fonts (e.g. ".SF NS Mono").
        if family.starts_with('.') {
            continue;
        }

        let style_name = match face.style {
            fontdb::Style::Normal => "Regular".to_string(),
            fontdb::Style::Italic => "Italic".to_string(),
            fontdb::Style::Oblique => "Oblique".to_string(),
        };

        families.entry(family).or_default().push(FontFace {
            weight: face.weight.0,
            italic: !matches!(face.style, fontdb::Style::Normal),
            style_name,
            post_script_name: face.post_script_name.clone(),
        });
    }

    families
        .into_iter()
        .map(|(family, mut faces)| {
            faces.sort_by(|a, b| a.weight.cmp(&b.weight).then(a.italic.cmp(&b.italic)));
            faces.dedup_by(|a, b| a.weight == b.weight && a.italic == b.italic);
            FontFamily { family, faces }
        })
        .collect()
}

#[tauri::command]
fn list_monospace_fonts() -> Vec<FontFamily> {
    // Enumeration + metric probing is done once per process, then cached; the
    // font set doesn't change while the app runs.
    static CACHE: OnceLock<Vec<FontFamily>> = OnceLock::new();
    CACHE.get_or_init(compute_monospace_fonts).clone()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![list_monospace_fonts])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
