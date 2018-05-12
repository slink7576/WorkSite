import {Summary} from "./Summary";
import {a} from "@angular/core/src/render3";
import {Vacansy} from "./Vacansy";
import {TypeOfUser} from "./TypeOfUser";

export class User
{
  login:string;
  type:TypeOfUser;
  summary:Summary;
  vacancies:Array<Vacansy> ;
  constructor(type:TypeOfUser,login:string) {
    this.type = type;
    this.login = login;
    this.vacancies = new Array<Vacansy>();
  }
  addVacancy(vac:Vacansy) {
     this.vacancies.push(vac);
  }
  updVacancy(ind:number, vac:Vacansy) {
    for(let i = 0; i < this.vacancies.length; i ++ )
    {
      if(this.vacancies[i].getPurpose() == vac.getPurpose())
      {
        this.vacancies[i] = vac;
      }
    }

}
  getVacancies() {
    return this.vacancies;
  }
  addSummary(sc:Summary) {
    if(this.summary == null) {
      this.summary = sc;
    }
  }
  updSummary(sc:Summary) {
    this.summary = sc;
  }
  getSummary() {
    return this.summary;
  }
  getSummaries() {
    let arr = new Array<Summary>();
    arr.push(this.summary);
    return arr;
  }
  getType() {
  return this.type;
}
  setSummary(sc:Summary) {
  this.summary = sc;
}
  setVacancy(vs:Array<Vacansy>) {
  this.vacancies = vs;
}
  getLogin() {
  return this.login;
}

}

