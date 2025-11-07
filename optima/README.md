# Optima - 物件管理システム デモページ

このディレクトリには、Optimaアプリケーションの静的デモページが含まれています。

## 📁 ファイル構成

- `index.html` - 物件一覧ページ（メイン）
- `property-detail.html` - 物件詳細ページ（サンプル）
- `README.md` - このファイル

## 🚀 GitHub Pagesへのデプロイ方法

### 1. ファイルをGitHubリポジトリにコピー

```bash
# GitHubリポジトリをクローン（初回のみ）
git clone https://github.com/Cosoado/Cosoado.github.io.git
cd Cosoado.github.io

# Optimaディレクトリを作成（まだ存在しない場合）
mkdir -p optima

# デモファイルをコピー
cp /path/to/optima/github-pages-demo/optima/* optima/
```

### 2. GitHubにプッシュ

```bash
git add optima/
git commit -m "Add Optima demo pages"
git push origin main
```

### 3. GitHub Pagesを有効化

1. GitHubリポジトリページにアクセス
2. Settings → Pages
3. Source: Deploy from a branch
4. Branch: main / (root) を選択
5. Save

### 4. デモページへアクセス

数分後、以下のURLでアクセス可能になります：

- 物件一覧: `https://cosoado.github.io/optima/index.html`
- 物件詳細: `https://cosoado.github.io/optima/property-detail.html`

## 🎨 特徴

- ✅ ログイン不要で閲覧可能
- ✅ レスポンシブデザイン（モバイル対応）
- ✅ モダンなUIデザイン
- ✅ Tailwind CSSを使用（CDN経由）
- ✅ モックデータ表示

## 📝 注意事項

- これは静的デモページです。実際のデータベースには接続されていません
- フォームやボタンは表示のみで、機能は実装されていません
- 実際のアプリケーション機能を使用する場合は、本番環境にログインしてください

## 🔗 関連リンク

- [GitHub Pages リポジトリ](https://github.com/Cosoado/Cosoado.github.io)
- [Optima 本番環境](https://your-optima-app-url.com)（要ログイン）

