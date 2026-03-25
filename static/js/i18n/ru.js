window.APP_I18N_LOCALES = window.APP_I18N_LOCALES || {};
window.APP_I18N_LOCALES['ru'] = {
    "languageName": "Русский",
    "ui": {
        "title": "Анализатор кода и генератор образовательных Gist",
        "description": "This app automatically finds a source file in your repository, analyzes it with AI, and creates a professional educational breakdown in English.",
        "languageLabel": "Язык интерфейса",
        "ghTokenLabel": "GitHub Personal Access Token (scopes: 'gist' and 'repo'):",
        "ghTokenPlaceholder": "ghp_...",
        "geminiTokenLabel": "Gemini API Key:",
        "geminiTokenPlaceholder": "AIza...",
        "repoPathLabel": "GitHub repository (format: owner/repo):",
        "repoPathPlaceholder": "example: OstinUA/ads.txt-app-ads.txt-sellers.json-Lines-Checker",
        "runButton": "Сгенерировать Code Review Gist",
        "readyLog": "Система готова. Заполните данные и нажмите кнопку."
    },
    "alerts": {
        "fillAllFields": "Пожалуйста, заполните все поля"
    },
    "errors": {
        "repoNotFound": "Could not find the repository. Check repository name and token permissions.",
        "treeFailed": "Could not fetch repository tree.",
        "noTargetFile": "No suitable source files were found for analysis (.py, .js, .go, etc.).",
        "fileDownloadFailed": "Could not download file content.",
        "generationFailed": "Could not generate text. Last error: {error}",
        "gistFailed": "Could not create Gist: {error}",
        "critical": "CRITICAL ERROR: {error}"
    },
    "log": {
        "starting": "Starting process...",
        "fetchingRepo": "Requesting repository data...",
        "fetchingTree": "Fetching file tree from branch {branch}...",
        "targetFileSelected": "Selected file for analysis: {path}",
        "codeDownloaded": "Code downloaded successfully. Building AI request...",
        "generatingWithModel": "Generating educational Gist (model: {model})...",
        "modelSkipped": "[SKIP {model}]: {error}",
        "modelNetworkError": "[NETWORK ERROR {model}]: {error}",
        "generated": "Successfully generated. Creating GitHub Gist...",
        "success": "SUCCESS! Your educational Gist is ready.",
        "link": "Link: {url}"
    }
};
