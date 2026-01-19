# 🚀 Инструкция по деплою

## Вариант 1: Vercel (Рекомендуется - самый простой)

### Через веб-интерфейс:
1. Зайдите на [vercel.com](https://vercel.com)
2. Зарегистрируйтесь через GitHub/GitLab/Bitbucket
3. Нажмите "Add New Project"
4. Подключите ваш репозиторий GitHub
5. Vercel автоматически определит настройки:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
6. Нажмите "Deploy"
7. Готово! Ваш сайт будет доступен по адресу `ваш-проект.vercel.app`

### Через CLI:
```bash
npm install -g vercel
vercel
```

## Вариант 2: Netlify

### Через веб-интерфейс:
1. Зайдите на [netlify.com](https://netlify.com)
2. Зарегистрируйтесь через GitHub
3. Нажмите "Add new site" → "Import an existing project"
4. Подключите ваш репозиторий
5. Настройки:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Нажмите "Deploy site"
7. Готово! Сайт будет доступен по адресу `ваш-проект.netlify.app`

### Через CLI:
```bash
npm install -g netlify-cli
netlify deploy --prod
```

## Вариант 3: GitHub Pages

1. Установите пакет для деплоя:
```bash
npm install --save-dev gh-pages
```

2. Добавьте в `package.json`:
```json
{
  "homepage": "https://ваш-username.github.io/igra",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

3. Создайте файл `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

4. Задеплойте:
```bash
npm run deploy
```

## Вариант 4: Cloudflare Pages

1. Зайдите на [pages.cloudflare.com](https://pages.cloudflare.com)
2. Подключите ваш GitHub репозиторий
3. Настройки:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. Нажмите "Save and Deploy"

## Вариант 5: Render

1. Зайдите на [render.com](https://render.com)
2. Создайте новый "Static Site"
3. Подключите репозиторий
4. Настройки:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
5. Нажмите "Create Static Site"

## ⚠️ Важные замечания

1. **Перед деплоем проверьте локально:**
```bash
npm run build
npm run preview
```

2. **Для работы React Router** убедитесь, что все маршруты редиректятся на `index.html` (файлы `vercel.json` и `netlify.toml` уже добавлены)

3. **Если используете localStorage**, он будет работать только в рамках одного домена/браузера. Для синхронизации между разными устройствами через интернет потребуется бэкенд или Firebase.

4. **Рекомендуемый вариант**: Vercel - самый простой и быстрый деплой с автоматическим HTTPS и CDN.

## 🔧 Локальная сборка для проверки

```bash
# Установить зависимости
npm install

# Собрать проект
npm run build

# Запустить локальный сервер для проверки
npm run preview
```

После сборки папка `dist` будет содержать готовые файлы для деплоя.

