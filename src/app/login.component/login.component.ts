import {Input, Component, EventEmitter, Output} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {User} from "../Entities/User";
import {Vacansy} from "../Entities/Vacansy";
import {Summary} from "../Entities/Summary";
import {TypeOfUser} from "../Entities/TypeOfUser";

@Component({
  selector: 'login-comp',
  templateUrl: './login.component.html'
})
export class LoginComponent{
  @Input() isAdmin: boolean;
  @Output()isAdminChange = new EventEmitter<boolean>();
  @Input() isAuthorized: boolean;
  @Output()isAuthorizedChange = new EventEmitter<boolean>();
  @Input() showVacancies: boolean;
  @Output()showVacanciesChange = new EventEmitter<boolean>();
  @Input() currentUser:User;
  @Output()currentUserChange = new EventEmitter<User>();
  LoaderStatus:boolean;
  errorMessage:string;
  constructor(private httpClient:HttpClient) {
    this.LoaderStatus = false;

  }
  sendHttpLogin(login:string, password:string) {
    if(login.length == 0 || password.length == 0) {
      this.errorMessage = "Please fill in all the fields!";
    }
    else {
      let tmp = "";
      for (let i = 0; i < password.length; i++) {
        tmp += String.fromCharCode(password.charCodeAt(i) + 5);
      }

      password = tmp;
      this.LoaderStatus = true;
      this.httpClient.get("http://178.150.221.150:4658/api/user/" + login + "/" + password).subscribe(
        (data: any) => {
          if(data == null) {
            this.errorMessage = "No such user found!";
            this.LoaderStatus = false;
          }
          if(data!=null) {
            if(data.UserSummary == undefined &&  data.vacansies == undefined) {

              this.isAdmin = true;
              this.isAuthorized = true;
              this.showVacancies = false;
              this.LoaderStatus = false;
              this.isAdminChange.emit(true);
              this.currentUser = new User(TypeOfUser.Admin , "");
              this.currentUserChange.emit(this.currentUser);
              this.isAuthorizedChange.emit(true);
              this.showVacanciesChange.emit(false);
              return;
            }
            if(data.UserSummary == null && data.vacansies == null || data.UserSummary != null && data.vacansies == null) {
              this.currentUser = new User(TypeOfUser.User, login);
              if(data.UserSummary != null) {
                let sum = new Summary(data.UserSummary.Name,data.UserSummary.Position,data.UserSummary.Info,data.UserSummary.Salary);
                this.currentUser.setSummary(sum);
              }

              this.isAuthorized = true;
              this.showVacancies = true;
              this.LoaderStatus = false;
              this.isAdmin = false;
              this.isAdminChange.emit(false);
              this.isAuthorizedChange.emit(true);
              this.showVacanciesChange.emit(true);
              this.currentUserChange.emit(this.currentUser);
              return;
            }
            else if(data.vacansies == null || data.vacansies.length != 0) {

              this.currentUser = new User(TypeOfUser.Company,login);

              if(data.vacansies != null) {
                let tmp = Array<Vacansy>();
                for(let i = 0; i < data.vacansies.length; i++) {
                  let summs = new Array<Summary>();
                  if(data.vacansies[i].OfferedSummarys  != null) {
                    for (let j = 0; j < data.vacansies[i].OfferedSummarys.length; j++) {
                      let tmp = new Summary(data.vacansies[i].OfferedSummarys[j].Name, data.vacansies[i].OfferedSummarys[j].Position,data.vacansies[i].OfferedSummarys[j].Info,data.vacansies[i].OfferedSummarys[j].Salary);
                      summs.push(tmp);
                    }
                  }
                  let vactmp = new Vacansy(data.vacansies[i].Purpose,data.vacansies[i].Salary,data.vacansies[i].Description,data.vacansies[i].Remote);
                  vactmp.setOfferedSummaries(summs);
                  tmp.push(vactmp);
                }
                this.currentUser.setVacancy(tmp);
              }

              this.isAuthorized = true;
              this.showVacancies = false;
              this.LoaderStatus = false;
              this.isAdmin = true;
              this.isAdminChange.emit(false);
              this.isAuthorizedChange.emit(true);
              this.showVacanciesChange.emit(false);
              this.currentUserChange.emit(this.currentUser);
              return;
            }
          }
        }
      );
    }
  }
  getLoader() {
    return this.LoaderStatus;
  }
}
