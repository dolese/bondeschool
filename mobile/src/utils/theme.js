export const COLORS = {
  primary:    "#00897B",
  primaryDark:"#00695C",
  primaryLight:"#4DB6AC",
  accent:     "#FFB300",
  white:      "#FFFFFF",
  bg:         "#F5F7FA",
  card:       "#FFFFFF",
  text:       "#1A2332",
  textLight:  "#6B7A99",
  textMuted:  "#9AA5BB",
  border:     "#E8EDF5",
  success:    "#2E7D32",
  danger:     "#C62828",
  warning:    "#F57F17",
  divI:       "#003366",
  divII:      "#005a99",
  divIII:     "#0099cc",
  divIV:      "#2299ee",
  gradeA:     "#1a6b2f",
  gradeB:     "#0b4f9e",
  gradeC:     "#7a5800",
  gradeD:     "#8b2500",
  gradeF:     "#6b0000",
};

export const FONTS = {
  h1: { fontSize: 28, fontWeight: "800", color: COLORS.text },
  h2: { fontSize: 22, fontWeight: "700", color: COLORS.text },
  h3: { fontSize: 18, fontWeight: "700", color: COLORS.text },
  h4: { fontSize: 15, fontWeight: "700", color: COLORS.text },
  body: { fontSize: 14, color: COLORS.text },
  small: { fontSize: 12, color: COLORS.textLight },
  label: { fontSize: 11, fontWeight: "700", color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 0.8 },
};

export const SHADOW = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 3,
};

export const gradeColor = g => COLORS[`grade${g}`] ?? COLORS.text;
export const divColor   = d => COLORS[`div${d}`] ?? COLORS.text;
