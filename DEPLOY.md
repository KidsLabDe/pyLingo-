# 🚀 pyLingo auf Vercel deployen (Kostenlos!)

Diese Anleitung erklärt Schritt für Schritt, wie du pyLingo kostenlos online stellst.

## Voraussetzungen

- GitHub Account (kostenlos)
- Vercel Account (kostenlos)
- Neon Account (kostenlos)

---

## Schritt 1: GitHub Repository

Das Projekt ist bereits auf GitHub. Falls nicht:

```bash
git push origin main
```

---

## Schritt 2: Neon Datenbank erstellen (kostenlos)

1. Gehe zu **[neon.tech](https://neon.tech)** und erstelle einen Account
2. Klicke auf **"Create Project"**
3. Wähle:
   - Name: `pylingo`
   - Region: `Europe (Frankfurt)` (oder nächste)
4. Nach der Erstellung siehst du die **Connection Strings**
5. Kopiere diese zwei URLs:
   - **Connection string** (beginnt mit `postgresql://...`)
   - **Connection string (with pooling)** (ebenfalls `postgresql://...`)

---

## Schritt 3: Vercel Deployment

1. Gehe zu **[vercel.com](https://vercel.com)** und melde dich mit GitHub an
2. Klicke auf **"Add New..." → "Project"**
3. Wähle das **pyLingo** Repository aus
4. **Wichtig:** Klicke auf **"Environment Variables"** und füge hinzu:

   | Name | Wert |
   |------|------|
   | `DATABASE_URL` | Die **pooled** Connection String von Neon |
   | `DIRECT_URL` | Die **direkte** Connection String von Neon |
   | `APP_SECRET` | Ein langer zufälliger Text (z.B. `mein-super-geheimer-schluessel-2024-pylingo`) |

5. Klicke auf **"Deploy"**

---

## Schritt 4: Datenbank initialisieren

Nach dem ersten Deployment musst du die Datenbank einrichten:

### Option A: Über Vercel CLI (empfohlen)

```bash
# Vercel CLI installieren
npm i -g vercel

# Mit Vercel verbinden
vercel link

# Umgebungsvariablen lokal laden
vercel env pull .env

# Datenbank initialisieren
npx prisma db push
npm run db:seed
```

### Option B: Manuell über Neon Console

1. Gehe zu Neon Dashboard → SQL Editor
2. Kopiere den Inhalt von `prisma/schema.prisma` und erstelle die Tabellen manuell

---

## Schritt 5: Fertig! 🎉

Deine App ist jetzt online unter: `https://pylingo-xxx.vercel.app`

**Gruppen-Code für die Hackerwerkstatt:** `KIDSLAB2024`

---

## Umgebungsvariablen Übersicht

| Variable | Beschreibung | Beispiel |
|----------|--------------|----------|
| `DATABASE_URL` | Neon Pooled Connection | `postgresql://user:pass@ep-xxx.eu-central-1.aws.neon.tech/pylingo?sslmode=require` |
| `DIRECT_URL` | Neon Direct Connection | `postgresql://user:pass@ep-xxx.eu-central-1.aws.neon.tech/pylingo?sslmode=require` |
| `APP_SECRET` | Geheimer Schlüssel für Cookies | `mein-geheimer-schluessel-2024` |

---

## Troubleshooting

### "Database connection failed"
→ Prüfe ob `DATABASE_URL` und `DIRECT_URL` korrekt sind

### "Prisma Client not found"
→ Redeploy auf Vercel (Settings → Deployments → Redeploy)

### Tabellen sind leer
→ Führe `npm run db:seed` aus (mit den richtigen Env-Variablen)

---

## Kosten

| Dienst | Kosten | Limits |
|--------|--------|--------|
| Vercel | **Kostenlos** | 100GB Bandbreite/Monat |
| Neon | **Kostenlos** | 0.5GB Speicher, 3GB Transfer/Monat |

Für eine Hackerwerkstatt mit 10-12 Jugendlichen völlig ausreichend!

---

## Updates deployen

Jedes Mal wenn du zu GitHub pushst, wird Vercel automatisch neu deployen:

```bash
git add .
git commit -m "Neue Lektionen hinzugefügt"
git push
```

---

Made with 💚 für die Hackerwerkstatt im KidsLab
