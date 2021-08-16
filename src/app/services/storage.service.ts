import { Injectable } from '@angular/core';
import { CacheService } from 'ionic-cache';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  readonly SETTINGS_KEY: string = "settings";
  readonly SETTINGS_GROUP: string = "settings";
  readonly SETTINGS_TTL = 10 * 365 * 24 * 60 * 60; // 10 year time to live

  constructor(private cache: CacheService) { }

  async setValue(key: string, value: any) {
    let jsonObj = JSON.stringify(value);
    //console.log("setValue: " + key + " ->" + jsonObj);
    return this.cache.saveItem(key, jsonObj, this.SETTINGS_GROUP, this.SETTINGS_TTL);
  }

  getValue(key: string): Promise<any> {
    return this.cache.getItem(key).then(res => {
      //console.log('getValue',res);
      return JSON.parse(res);
    });
  }
}
