window.APP_I18N_LOCALES = window.APP_I18N_LOCALES || {};
window.APP_I18N_LOCALES['zh'] = {
    "languageName": "中文",
    "ui": {
        "title": "代码分析与教学 Gist 生成器",
        "description": "此应用会自动在你的仓库中查找源码文件，使用 AI 进行分析，并生成专业的英文教学解析。",
        "languageLabel": "界面语言",
        "ghTokenLabel": "GitHub Personal Access Token（权限：'gist' 和 'repo'）：",
        "ghTokenPlaceholder": "ghp_...",
        "geminiTokenLabel": "Gemini API Key：",
        "geminiTokenPlaceholder": "AIza...",
        "repoPathLabel": "GitHub 仓库（格式：owner/repo）：",
        "repoPathPlaceholder": "例如：OstinUA/ads.txt-app-ads.txt-sellers.json-Lines-Checker",
        "runButton": "生成代码评审 Gist",
        "readyLog": "系统已就绪。请填写信息并点击按钮。"
    },
    "alerts": {
        "fillAllFields": "请填写所有字段"
    },
    "errors": {
        "repoNotFound": "未找到仓库。请检查仓库名称和 token 权限。",
        "treeFailed": "无法获取仓库文件树。",
        "noTargetFile": "未找到适合分析的源码文件（.py、.js、.go 等）。",
        "fileDownloadFailed": "无法下载文件内容。",
        "generationFailed": "无法生成文本。最后错误：{error}",
        "gistFailed": "无法创建 Gist：{error}",
        "critical": "严重错误：{error}"
    },
    "log": {
        "starting": "开始处理...",
        "fetchingRepo": "正在请求仓库数据...",
        "fetchingTree": "正在从分支 {branch} 获取文件树...",
        "targetFileSelected": "已选择用于分析的文件：{path}",
        "codeDownloaded": "代码下载成功。正在构建 AI 请求...",
        "generatingWithModel": "正在生成教学 Gist（模型：{model}）...",
        "modelSkipped": "[跳过 {model}]：{error}",
        "modelNetworkError": "[网络错误 {model}]：{error}",
        "generated": "生成成功。正在创建 GitHub Gist...",
        "success": "成功！你的教学 Gist 已准备好。",
        "link": "链接：{url}"
    }
};
