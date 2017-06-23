export function prepareSearchString(texts) {
    return texts.map(text => {
        return text.replace(/<\/?[^>]+>/g, ' ')
            .replace(/[^A-Za-zА-Яа-яЁё0-9]|\s/g, ' ')
            .replace(/\s{2,}/g, ' ')
            .toLowerCase();
    }).join(' ');
}
