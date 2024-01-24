function generateNestedObject(obj) {
    const nestedObject = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const parts = key.split('.');
            let currentLevel = nestedObject;
            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                if (!currentLevel[part]) {
                    currentLevel[part] = {};
                }
                if (i === parts.length - 1) {
                    currentLevel[part] = obj[key];
                }
                currentLevel = currentLevel[part];
            }
        }
    }
    return nestedObject;
}

module.exports = generateNestedObject;
