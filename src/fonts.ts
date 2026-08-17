import { invoke } from "@tauri-apps/api/core";

export interface FontFace {
  weight: number;
  italic: boolean;
  styleName: string;
  postScriptName: string;
}

export interface FontFamily {
  family: string;
  faces: FontFace[];
}

// Raw shape returned by the Rust command (snake_case).
interface RawFace {
  weight: number;
  italic: boolean;
  style_name: string;
  post_script_name: string;
}
interface RawFamily {
  family: string;
  faces: RawFace[];
}

export async function fetchMonospaceFonts(): Promise<FontFamily[]> {
  const raw = await invoke<RawFamily[]>("list_monospace_fonts");
  return raw.map((f) => ({
    family: f.family,
    faces: f.faces.map((face) => ({
      weight: face.weight,
      italic: face.italic,
      styleName: face.style_name,
      postScriptName: face.post_script_name,
    })),
  }));
}

const WEIGHT_NAMES: Record<number, string> = {
  100: "Thin",
  200: "ExtraLight",
  300: "Light",
  400: "Regular",
  500: "Medium",
  600: "SemiBold",
  700: "Bold",
  800: "ExtraBold",
  900: "Black",
};

export function faceLabel(face: FontFace): string {
  const name = WEIGHT_NAMES[face.weight] ?? String(face.weight);
  if (face.italic) {
    return name === "Regular" ? "Italic" : `${name} Italic`;
  }
  return name;
}

// Pick the face closest to Regular/upright as the default preview face.
export function defaultFace(faces: FontFace[]): FontFace {
  const upright = faces.filter((f) => !f.italic);
  const pool = upright.length ? upright : faces;
  return pool.reduce((best, f) =>
    Math.abs(f.weight - 400) < Math.abs(best.weight - 400) ? f : best,
  );
}
