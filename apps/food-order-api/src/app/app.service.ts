import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
@Injectable()
export class AppService {
  randomString (length: number, readable: boolean, noSpecial: boolean) {
    let charset
    if (readable) {
      charset = '23456789ABCDEFGHJKLMNPQRSTUVXYZabcdefghijklmnopqrstuvwxyz' + (!noSpecial ? '-._' : '');
    } else {
      charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz' + (!noSpecial ? '-._' : '');
    }
    let result = '';
  
    while (length > 0) {
        var random = randomBytes(16);
  
        random.forEach(function(c) {
            if (length == 0) {
                return;
            }
            if (c < charset.length) {
                result += charset[c];
                length--;
            }
        });
    }
    return result;
  }
  
}
