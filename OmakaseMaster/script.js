const translations = {
    en: {
        title: 'OmakaseMaster - Terms of Service & Privacy Policy',
        privacyTitle: 'Privacy Policy - OmakaseMaster',
        termsTitle: 'Terms of Service - OmakaseMaster',
        appIconText: 'Sushi',
        appInfoTitle: 'App Information',
        appNameLabel: 'App Name',
        appNameValue: 'OmakaseMaster (Sushi App)',
        providerLabel: 'Provider',
        categoryLabel: 'Category',
        categoryValue: 'Lifestyle・Education',
        legalDocsTitle: 'Legal Documents',
        termsLink: 'Terms of Service',
        privacyLink: 'Privacy Policy',
        backHome: '← Back to Home'
    },
    ja: {
        title: 'OmakaseMaster - 利用規約・プライバシーポリシー',
        privacyTitle: 'プライバシーポリシー - OmakaseMaster',
        termsTitle: '利用規約 - OmakaseMaster',
        appIconText: '寿司',
        appInfoTitle: 'アプリ情報',
        appNameLabel: 'アプリ名',
        appNameValue: 'OmakaseMaster（寿司アプリ）',
        providerLabel: '提供者',
        categoryLabel: 'カテゴリ',
        categoryValue: 'ライフスタイル・教育',
        legalDocsTitle: '法的文書',
        termsLink: '利用規約',
        privacyLink: 'プライバシーポリシー',
        backHome: '← トップページに戻る'
    },
    zh: {
        title: 'OmakaseMaster - 服务条款和隐私政策',
        privacyTitle: '隐私政策 - OmakaseMaster',
        termsTitle: '服务条款 - OmakaseMaster',
        appIconText: '寿司',
        appInfoTitle: '应用信息',
        appNameLabel: '应用名称',
        appNameValue: 'OmakaseMaster（寿司应用）',
        providerLabel: '提供者',
        categoryLabel: '类别',
        categoryValue: '生活方式・教育',
        legalDocsTitle: '法律文件',
        termsLink: '服务条款',
        privacyLink: '隐私政策',
        backHome: '← 返回主页'
    },
    ko: {
        title: 'OmakaseMaster - 이용약관 및 개인정보처리방침',
        privacyTitle: '개인정보처리방침 - OmakaseMaster',
        termsTitle: '이용약관 - OmakaseMaster',
        appIconText: '스시',
        appInfoTitle: '앱 정보',
        appNameLabel: '앱 이름',
        appNameValue: 'OmakaseMaster（스시 앱）',
        providerLabel: '제공자',
        categoryLabel: '카테고리',
        categoryValue: '라이프스타일・교육',
        legalDocsTitle: '법적 문서',
        termsLink: '이용약관',
        privacyLink: '개인정보처리방침',
        backHome: '← 홈으로 돌아가기'
    }
};

let currentLanguage = 'en';

function toggleLanguageMenu() {
    const menu = document.getElementById('language-menu');
    menu.classList.toggle('show');
}

function changeLanguage(lang) {
    currentLanguage = lang;
    const menu = document.getElementById('language-menu');
    if (menu) menu.classList.remove('show');

    // Update current language display
    const langCodes = { en: 'EN', ja: 'JP', zh: 'CN', ko: 'KR' };
    const currentLangEl = document.getElementById('current-language');
    if (currentLangEl) currentLangEl.textContent = langCodes[lang];

    // Update active language option
    document.querySelectorAll('.language-option').forEach(option => {
        option.classList.remove('active');
        if (option.getAttribute('onclick').includes(`'${lang}'`)) {
            option.classList.add('active');
        }
    });

    const t = translations[lang];
    const pageType = document.body.dataset.page; // 'index', 'privacy', or 'terms'

    // Update Page Title
    if (pageType === 'index') document.title = t.title;
    else if (pageType === 'privacy') document.title = t.privacyTitle;
    else if (pageType === 'terms') document.title = t.termsTitle;

    // Update text content for elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (t[key]) el.textContent = t[key];
    });

    // Handle Content Sections for Legal Docs
    if (pageType === 'privacy' || pageType === 'terms') {
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
            section.style.display = 'none'; // Ensure hidden
        });
        const activeSection = document.getElementById(`content-${lang}`);
        if (activeSection) {
            activeSection.classList.add('active');
            activeSection.style.display = 'block';

            // Also update the back link text inside the active section if generic selector fails
            const backLink = activeSection.querySelector('.back-link');
            if (backLink) backLink.textContent = t.backHome;
        }
    }
}

// Close language menu when clicking outside
document.addEventListener('click', function (event) {
    const languageSwitcher = document.querySelector('.language-switcher');
    const languageMenu = document.getElementById('language-menu');

    if (languageSwitcher && languageMenu &&
        !languageSwitcher.contains(event.target) &&
        !languageMenu.contains(event.target)) {
        languageMenu.classList.remove('show');
    }
});

// Initialize on load
document.addEventListener('DOMContentLoaded', function () {
    // Attempt to detect browser language or default to en
    // const browserLang = navigator.language.slice(0, 2);
    // const supportedLangs = ['en', 'ja', 'zh', 'ko'];
    // const initialLang = supportedLangs.includes(browserLang) ? browserLang : 'en';

    // For consistency with original behavior, default to EN first, but user can change it.
    changeLanguage('en');
});
