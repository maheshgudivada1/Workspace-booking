import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
  :root{
    --bg: #f6f7fb;
    --muted: #6b7280;
    --text: #0f172a;
  }
  *{ box-sizing: border-box; }
  html,body,#root{ height:100%; }
  body {
    margin:0;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
    background: var(--bg);
    color: var(--text);
    -webkit-font-smoothing:antialiased;
    -moz-osx-font-smoothing:grayscale;
    padding-bottom: 60px;
  }

  /* small utility */
  button { font-family: inherit; }

  /* ensure images and svgs don't overflow */
  img, svg { max-width: 100%; height: auto; display: block; }
`;

export default GlobalStyles;
