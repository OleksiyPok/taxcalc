# Trip cost calculator

Single-page trip cost calculator (fuel, wear, time by rate mode).

## Project structure

```
Taxi/
├── index.html      # markup
├── css/
│   └── styles.css  # styles
├── js/
│   └── app.js      # logic
├── .nojekyll
└── README.md
```

## Local run

Use a local server so CSS and JS load correctly:

```bash
npx --yes serve .
```

Then open **http://localhost:3000** (or the port shown in the terminal).

Opening `index.html` directly (`file://`) may fail to load `css/` and `js/` in some browsers.

## GitHub Pages

1. Push all files to GitHub (`index.html`, `css/`, `js/`, `.nojekyll`).
2. **Settings** → **Pages** → deploy from branch `main`, folder **`/ (root)`**.
3. Site URL: `https://<username>.github.io/<repo>/`
