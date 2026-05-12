const fs = require('fs');

const paths = [
    './public/favicon.ico',
    './app/favicon.ico',
];

paths.forEach(p => {
    if (fs.existsSync(p)) {
        fs.unlinkSync(p);
        console.log('Deleted:', p);
    }
});
