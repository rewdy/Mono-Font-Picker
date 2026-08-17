use std::collections::BTreeMap;

use serde::Serialize;

#[derive(Serialize, Clone)]
struct FontFace {
    weight: u16,
    italic: bool,
    style_name: String,
    post_script_name: String,
}

#[derive(Serialize)]
struct FontFamily {
    family: String,
    faces: Vec<FontFace>,
}

#[tauri::command]
fn list_monospace_fonts() -> Vec<FontFamily> {
    let mut db = fontdb::Database::new();
    db.load_system_fonts();

    let mut families: BTreeMap<String, Vec<FontFace>> = BTreeMap::new();

    for face in db.faces() {
        if !face.monospaced {
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![list_monospace_fonts])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
