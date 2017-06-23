/* eslint-disable import/no-named-default */
import { default as fsOrig } from 'fs';
import path                  from 'path';
import Base                  from 'service-layer/Base';
import X                     from 'service-layer/Exception';
import { promisifyAll }      from 'bluebird';

import { dumpImage, _createImageName } from '../utils.js';
import { testStaticPath, staticPath, staticUrl, postImagesMaxSize }  from './../../../etc/config';

const fs = promisifyAll(fsOrig);

export default class Create extends Base {
    static validationRules = {
        image : ['not_empty', 'required']
    };

    async execute(data) {
        await this._validateImage(data.image);

        const directoryPath = await this._makeUserDirectory();
        const imageName = _createImageName(data.image);
        const imageLink = await this._uploadImage(data.image, directoryPath, imageName);

        return {
            data : dumpImage(imageName, imageLink)
        };
    }

    async _validateImage(image) {
        if (!image.size) {
            await fs.unlinkAsync(image.path);
            throw new X({
                code   : 'NO_IMAGE',
                fields : {
                    image : 'NO_IMAGE'
                }
            });
        }

        if (image.type.indexOf('image') < 0) {
            await fs.unlinkAsync(image.path);
            throw new X({
                code   : 'FORMAT_ERROR',
                fields : {
                    image : 'WRONG_TYPE'
                }
            });
        }

        if (image.size > postImagesMaxSize) {
            await fs.unlinkAsync(image.path);
            throw new X({
                code   : 'FORMAT_ERROR',
                fields : {
                    image : 'TOO_BIG'
                }
            });
        }
    }

    async _makeUserDirectory() {
        const directoryPath = path.join(process.env.TEST_MODE ? testStaticPath : staticPath, '/images');

        try {
            await fs.mkdirAsync(directoryPath);
        } catch (err) {
            if (err.code !== 'EEXIST') {
                throw new X({
                    code   : err.code,
                    fields : {
                        path : err.path
                    }
                });
            }
        }

        return directoryPath;
    }

    async _uploadImage(image, directoryPath, imageName) {
        const imagePath = path.join(directoryPath, imageName);

        await fs.renameAsync(image.path, imagePath);

        return `${staticUrl}/images/${imageName}`;
    }
}
