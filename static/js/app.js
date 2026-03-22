function log(message) {
    const logDiv = document.getElementById('log');
    logDiv.innerText += `\n[${new Date().toLocaleTimeString()}] ${message}`;
    logDiv.scrollTop = logDiv.scrollHeight;
}

async function startProcess() {
    const ghToken = document.getElementById('gh_token').value.trim();
    const geminiToken = document.getElementById('gemini_token').value.trim();
    const repoPath = document.getElementById('repo_path').value.trim();
    const btn = document.getElementById('run_btn');

    if (!ghToken || !geminiToken || !repoPath) {
        alert('Пожалуйста, заполните все поля');
        return;
    }

    btn.disabled = true;
    document.getElementById('log').innerText = 'Начинаем процесс...';

    try {
        const ghHeaders = { Authorization: `token ${ghToken}`, Accept: 'application/vnd.github.v3+json' };

        log('Запрашиваем данные репозитория...');
        const repoRes = await fetch(`https://api.github.com/repos/${repoPath}`, { headers: ghHeaders });
        if (!repoRes.ok) throw new Error('Не удалось найти репозиторий. Проверьте название и права токена.');
        const repoData = await repoRes.json();
        const defaultBranch = repoData.default_branch;

        log(`Получаем структуру файлов из ветки ${defaultBranch}...`);
        const treeRes = await fetch(`https://api.github.com/repos/${repoPath}/git/trees/${defaultBranch}?recursive=1`, { headers: ghHeaders });
        if (!treeRes.ok) throw new Error('Не удалось получить дерево файлов.');
        const treeData = await treeRes.json();

        const codeExtensions = ['.py', '.js', '.ts', '.go', '.rs', '.java', '.cpp', '.cs', '.php', '.rb'];
        const ignoredKeywords = ['test', 'spec', 'min.js', 'config', 'setup.py'];

        const targetFile = treeData.tree.find((file) => {
            if (file.type !== 'blob') return false;
            const lowerPath = file.path.toLowerCase();
            const hasCodeExt = codeExtensions.some((ext) => lowerPath.endsWith(ext));
            const isIgnored = ignoredKeywords.some((kw) => lowerPath.includes(kw));
            return hasCodeExt && !isIgnored;
        });

        if (!targetFile) {
            throw new Error('Не найдено подходящих файлов с исходным кодом (.py, .js, .go и т.д.) для анализа.');
        }

        log(`Выбран файл для анализа: ${targetFile.path}`);

        const fileRes = await fetch(`https://api.github.com/repos/${repoPath}/contents/${targetFile.path}`, { headers: ghHeaders });
        if (!fileRes.ok) throw new Error('Не удалось скачать содержимое файла.');
        const fileData = await fileRes.json();

        const decodedContentBase64 = window.atob(fileData.content.replace(/\n/g, ''));
        const decodedCode = new TextDecoder('utf-8').decode(new Uint8Array([...decodedContentBase64].map((char) => char.charCodeAt(0))));
        log('Код успешно скачан. Формируем запрос для ИИ...');

        const promptContext = `Act as an expert Senior Software Engineer, Tech Lead, and Educator.
I am providing you with the source code of a file named "${targetFile.path}" from a GitHub repository.

Code:
\`\`\`
${decodedCode}
\`\`\`

Your exact task: Create a highly professional, engaging, and deeply educational Markdown document suitable for a developer-focused GitHub Gist.
CRITICAL REQUIREMENTS:
1. MUST be written entirely in English.
2. Provide a compelling title (H1) for the Gist.
3. Briefly explain the overall purpose of this file within a broader context.
4. Extract the most interesting, complex, or core logical snippet from the provided code. DO NOT just dump the entire file.
5. Provide this extracted snippet in a code block, but add YOUR OWN highly detailed, line-by-line comments inside the code block explaining exactly HOW and WHY it works.
6. Below the code block, write a "Deep Dive" section explaining the underlying concepts, algorithmic choices, or best practices demonstrated in this code.
7. The tone must be professional, insightful, and pedagogical.
8. Output pure Markdown format. Do not add conversational filler outside the markdown content.`;

        const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
        let aiText = null;
        let lastError = '';

        for (const model of modelsToTry) {
            log(`Генерация образовательного Gist (модель: ${model})...`);

            try {
                const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiToken}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: promptContext }] }],
                    }),
                });

                if (geminiRes.ok) {
                    const geminiData = await geminiRes.json();
                    aiText = geminiData.candidates[0].content.parts[0].text;
                    aiText = aiText.replace(/^```markdown\n/, '').replace(/```$/, '').trim();
                    log('Успешно сгенерировано. Создаем Gist на GitHub...');
                    break;
                }

                const errData = await geminiRes.json().catch(() => ({}));
                lastError = errData.error?.message || `HTTP ${geminiRes.status}`;
                log(`[ПРОПУСК ${model}]: ${lastError}`);
            } catch (e) {
                lastError = e.message;
                log(`[СЕТЕВАЯ ОШИБКА ${model}]: ${lastError}`);
            }
        }

        if (!aiText) {
            throw new Error(`Не удалось сгенерировать текст. Последняя ошибка: ${lastError}`);
        }

        const gistFilename = `Analysis_${targetFile.path.split('/').pop().replace(/\..+$/, '')}.md`;

        const gistRes = await fetch('https://api.github.com/gists', {
            method: 'POST',
            headers: {
                Authorization: `token ${ghToken}`,
                Accept: 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                description: `Deep Dive Code Analysis: ${targetFile.path}`,
                public: true,
                files: {
                    [gistFilename]: {
                        content: aiText,
                    },
                },
            }),
        });

        if (!gistRes.ok) {
            const errData = await gistRes.json().catch(() => ({}));
            throw new Error(`Не удалось создать Gist: ${errData.message || gistRes.status}`);
        }

        const gistData = await gistRes.json();

        log('УСПЕШНО! Ваш образовательный Gist готов.');
        log(`Ссылка: ${gistData.html_url}`);
    } catch (error) {
        log(`КРИТИЧЕСКАЯ ОШИБКА: ${error.message}`);
    } finally {
        btn.disabled = false;
    }
}

document.getElementById('run_btn').addEventListener('click', startProcess);
