const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Função que cria a configuração do Multer dinamicamente
const uploadImage = (destinonFolder, baseFolder = 'uploads') => {
    if (!destinonFolder) {
        throw new Error('O nome da pasta de destino é obrigatório.');
    }

    const fullPath = path.join(__dirname, '..', baseFolder, destinonFolder);

    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
    }

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, fullPath);
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const extension = file.mimetype.split('/')[1];
            cb(null, `${uniqueSuffix}.${extension}`);
        }
    });

    const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp'
    ];

    const fileFilter = (req, file, cb) => {
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Formato de imagem não suportado! Use JPEG, JPG, PNG ou WEBP.'), false);
        }
    };

    return multer({
        storage,
        limits: {
            fileSize: 1024 * 1024 * 5 // 5MB
        },
        fileFilter
    });
};

module.exports = uploadImage;
