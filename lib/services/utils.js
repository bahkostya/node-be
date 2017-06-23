import uuid from 'uuid';

export function dumpUser(user) {
    return {
        id         : user.id,
        status     : user.status,
        email      : user.email,
        firstName  : user.firstName,
        secondName : user.secondName,
        createdAt  : user.createdAt
    };
}

export function dumpNews(news) {
    return {
        id          : news.id,
        title       : news.title,
        subtitle    : news.subtitle,
        text        : news.text,
        isPublished : news.isPublished,
        image       : news.image
    };
}

export function dumpImage(name, url) {
    return {
        id : name.split('.')[0],
        url
    };
}

export function _createImageName(image) {
    const imageName = uuid.v1();

    const match = image.name.match(/.+\.([^.]+)$/);
    const imageExtension = match ? match[1] : '';

    const fullImageName = `${imageName}.${imageExtension}`;

    return fullImageName;
}
