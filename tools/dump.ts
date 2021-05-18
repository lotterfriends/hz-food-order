const shell = require('shelljs');

const CONTAINER = 'hz-mysql'

const DB_NAME = 'hzoo'
const DB_USER = 'root'
const DB_PASSWORD = 'root'

const NO_DATA = ['order', 'order_item']

const FOLDER = 'dumps';

const addLeadingZero = (param) => {
  return param < 10 ? `0${param}` : `${param}`;
}

const getFilenameDate = () => {
  const date = new Date();

  const resultArray = [];
  resultArray.push(addLeadingZero(date.getFullYear()));
  resultArray.push(addLeadingZero(date.getMonth() + 1));
  resultArray.push(addLeadingZero(date.getDate()));
  resultArray.push('_');
  resultArray.push(addLeadingZero(date.getHours()));
  resultArray.push(addLeadingZero(date.getMinutes()));
  resultArray.push(addLeadingZero(date.getSeconds()));
  
  return resultArray.join('');
}

const getFilename = () => {
  return `${DB_NAME}_${getFilenameDate()}.backup.sql`;
}

const filename = getFilename();

shell.touch(`${FOLDER}/${filename}`)

shell.exec(`docker exec ${CONTAINER} /usr/bin/mysqldump \
  --extended-insert=FALSE \
  ${NO_DATA.map((e) => `--ignore-table=${DB_NAME}.${e}`).join(' ')} \
  --skip-set-charset \
  -u ${DB_USER} \
  --password=${DB_PASSWORD} \
  ${DB_NAME} >> ${FOLDER}/${filename}`);

NO_DATA.forEach(table => {
  
  shell.exec(`docker exec ${CONTAINER} /usr/bin/mysqldump \
    --skip-comments \
    --no-data \
    --skip-set-charset \
    -u ${DB_USER} \
    --password=${DB_PASSWORD} \
    ${DB_NAME} \
    ${table} >> ${FOLDER}/${filename}`);

});

shell.exec(`sed -i 's/utf8mb4_0900_ai_ci/utf8mb4_unicode_ci/g' ${FOLDER}/${filename}`)