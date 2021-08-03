import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { InAppBrowserOptions } from '@ionic-native/in-app-browser';
import { Observable, } from 'rxjs';
import { CacheService } from "ionic-cache";

/*
  Consume api resources.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.

  https://opentdb.com/

*/

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // A global place to tell all the programs how to open external pages
  public browserOptions: InAppBrowserOptions = {
    location: 'yes',//Or 'no' 
    hidden: 'no', //Or  'yes'
    clearcache: 'yes',
    clearsessioncache: 'yes',
    zoom: 'yes',//Android only ,shows browser zoom controls 
    hardwareback: 'yes',
    mediaPlaybackRequiresUserAction: 'no',
    shouldPauseOnSuspend: 'no', //Android only 
    closebuttoncaption: 'Close', //iOS only
    disallowoverscroll: 'no', //iOS only 
    toolbar: 'yes', //iOS only 
    enableViewportScale: 'no', //iOS only 
    allowInlineMediaPlayback: 'no',//iOS only 
    presentationstyle: 'pagesheet',//iOS only 
    fullscreen: 'yes',//Windows only    
  };

  sources = [];
  retired = [];
  filteredSoources=[];
  
  token="";

//  https://opentdb.com/api_token.php?command=request

  GROUP_KEY = 'triviality-group';
  ttl = 60 * 15; // 15 miuntes  to live
  apiUrl: String = "https://newsapi.org";
  apiKey: String = "891936083b324696939b66d8afa0b3fc";
  constructor(public http: HttpClient, private cache: CacheService) {

  }

  public getToken(): Observable<any> {
    return this.http.get('https://opentdb.com/api_token.php?command=request');
  }

  public resetToken(token): Observable<any> {
    return this.http.get('https://opentdb.com/api_token.php?command=reset&token='+token);
  }

  public getQuestions(token:string, num:number): Observable<any> {
    return this.http.get('https://opentdb.com/api.php?amount='+num+'&token='+token);
  }

  public getSources(): Observable<any> {
    var url = this.apiUrl + '/v2/sources?apiKey=' + this.apiKey;
    return this.cache.loadFromObservable(url, this.http.get(url), this.GROUP_KEY, this.ttl)
  }

  public getSelectedSources(): any[] {
    return this.sources;
  }

  public getUnretiredSelectedSources(): any[] {
    var result=[];
    this.sources.forEach(element => {
      var retiredIdx = this.retired.indexOf(element.id);
      if(retiredIdx < 0){
        result.push(element);      
      }
    });
    return result;
  }

  public toggleSource(item) {
    var x = this.sources.filter(row => row.id == item.id);
    if (x.length == 1) {
      var newlist = this.sources.filter(row => row.id != item.id); // remove it
      this.sources = newlist;
    } else {
      this.sources.push(item);
    }
    this.settingsProvider_setValue("sources", this.sources).then(res => {
      console.log(res);
    }).catch();
  }

  isSelected(item) {
    var x = this.sources.filter(row => row.id == item.id);
    return x.length >= 1;
  }

  isRetired(item) : boolean {
    var x = this.retired.filter(row => row == item.id);
    //console.log(item,item.id,"Retired:  "+((x.length >= 1)?"**YES":"**NO"))
    if(x.length>0){
      // console.log("Retired: "+item.id);
    }
    return x.length > 0 ? true : false;
  }

  async retire(item ){
    var x = this.retired.filter(row => row == item.id);
    if(x.length <= 0){
      this.retired.push(item.id);
      await this.settingsProvider_setValue("retired", this.retired);  
      console.log("retired list",this.retired);
    }
  }

  async unretire(item ){
    var x = this.retired.filter(row => row == item.id);
    if(x.length>0){
      var newlist = this.retired.filter(row => row != item.id); // remove it
      await this.settingsProvider_setValue("retired", newlist);  
      this.retired = newlist;
    }
  }

  loadRetired(): Promise<any> {
    return this.settingsProvider_getValue("retired").then(res => {
      console.log(res);
      this.retired = res;
    }).catch(err => {
      // I don't care
    });
  }


  loadSources(): Promise<any> {
    return this.settingsProvider_getValue("sources").then(res => {
      console.log(res);
      this.sources = res;
    }).catch(err => {
      // I don't care
    });
  }

  // TODO consider moving this

  SETTINGS_KEY: string = "settings";
  SETTINGS_GROUP: string = "settings";
  SETTINGS_TTL = 10 * 365 * 24 * 60 * 60; // 10 year time to live

  settingsProvider_setValue(key: string, value: any) {
    let jsonObj = JSON.stringify(value);
    console.log("setValue: " + key + " ->" + jsonObj);
    return this.cache.saveItem(key, jsonObj, this.SETTINGS_GROUP, this.SETTINGS_TTL);
  }

  settingsProvider_getValue(key: string): Promise<any> {
    return this.cache.getItem(key).then(res => {
      console.log('getValue');
      console.log(res);
      return JSON.parse(res);
    });
  }

  clearSettings(): Promise<any> {
    return this.cache.clearGroup(this.SETTINGS_GROUP);
  }
// -------------------------------------------------------------------
//  helpers
// -------------------------------------------------------------------

}
