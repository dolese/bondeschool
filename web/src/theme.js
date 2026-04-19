export const C = {
  primary:"#00897B", primaryDark:"#00695C", primaryLight:"#4DB6AC",
  accent:"#FFB300", accentLight:"#FFF3E0",
  bg:"#F0F4F8", card:"#FFFFFF", border:"#E2EAF0",
  text:"#1A2332", textSub:"#4A5568", textMuted:"#8A99AE",
  success:"#2E7D32", danger:"#C62828", warning:"#E65100", info:"#0277BD",
  sidebarBg:"#00695C", sidebarActive:"rgba(255,255,255,0.15)",
};
export const GRADE_C = { A:"#1a6b2f",B:"#0b4f9e",C:"#7a5800",D:"#8b2500",F:"#6b0000" };
export const GRADE_B = { A:"#d4f7e0",B:"#d0e4ff",C:"#fff3cc",D:"#ffe0cc",F:"#ffd0d0" };
export const DIV_C   = { "I":"#003366","II":"#005a99","III":"#0099cc","IV":"#44aadd","0":"#999" };
export const getGrade = s => { const n=Number(s); if(s===""||s===null||s===undefined||isNaN(n))return null; if(n>=75)return"A";if(n>=65)return"B";if(n>=45)return"C";if(n>=30)return"D";return"F"; };
export const gp = g => ({A:1,B:2,C:3,D:4,F:5}[g]??5);
export const getDiv = p => { if(p<=17)return"I";if(p<=21)return"II";if(p<=25)return"III";if(p<=33)return"IV";return"0"; };
