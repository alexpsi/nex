
execa.shellSync('git remote -v');
const re = /origin\t(git@github\.com:|https:\/\/github\.com\/)(.*).git \(push\)/m;
