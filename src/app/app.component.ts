import { Component } from '@angular/core';
import {Vacansy} from "./Entities/Vacansy";
import {User} from "./Entities/User";
import {Summary} from "./Entities/Summary";
import {HttpClient} from '@angular/common/http';
import {TypeOfUser} from "./Entities/TypeOfUser";





@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  maxSalary = 999999;
  serverLocation = "http://178.150.221.150:4658/api/";


  workVacancies = new Array<Vacansy>();
  workSummaries = new Array<Summary>();



  searchPreferences: string;
  currentUser: User;

  showVacancies: boolean;
  isSearchPreferences:boolean;
  isAuthorized: boolean;
  isAddUserFormStatus: boolean;
  isAddHrFormStatus: boolean;
  isWatchingHimself: boolean;
  isEditing:boolean;
  isAdmin:boolean;


  isSuccessWindow:boolean;
  isErrorWindow:boolean;
  infoMessage:string;


  constructor(private httpClient:HttpClient) {

    this.getHttpSummaries();
    this.getHttpVacancies();
    this.isAdmin = false;
    this.isAuthorized = false;
    this.isAddUserFormStatus = false;
    this.isAddHrFormStatus = false;
    this.isWatchingHimself = false;
    this.isSearchPreferences = false;
    this.isSuccessWindow = false;
    this.isErrorWindow = false;
    this.isEditing = false;


  }
  //TriggerBlock
  onUpdVacancy(index:number, purpose:string, salary:number, description:string, isRemote:boolean) {

    if(purpose.length < 6) {
      this.switchDangerWindow("Position must be at least 6 characters");
    }
    else if(salary < 50) {
      this.switchDangerWindow("Salary must be positive and more than 50");
    }
    else if(description.length < 6) {
      this.switchDangerWindow("Description must be at least 6 characters");
    }
    else{

      let vacancy = new Vacansy(purpose,salary,description,isRemote);
      this.currentUser.updVacancy(index,vacancy);
      this.updHttpVacancy(vacancy);
      this.onRefresh();
      this.switchSuccessWindow("Vacancy was successfully updated!");
    }


  }
  onUpdSummary(name:string, position:string, info:string, salary:number) {
    if(name.length < 6) {
      this.switchDangerWindow("Name must be at least 6 characters");
    }
    else if(position.length < 6) {
      this.switchDangerWindow("Position must be at least 6 characters");
    }
    else if(info.length < 6) {
      this.switchDangerWindow("Info must be at least 6 characters");
    }
    else if(salary < 50) {
      this.switchDangerWindow("Salary must be positive and more than 50");
    }
    else {
      let summary = new Summary(name,position,info,salary);
      this.currentUser.updSummary(summary);
      this.updHttpSummary(summary);
      this.onRefresh();
      this.switchSuccessWindow("You successfully updated your summary!");
    }

  }
  onMyInfo() {
    if(this.showVacancies) {
      if(this.currentUser.getSummary() != null) {
        this.isWatchingHimself = true;
        this.workSummaries = this.currentUser.getSummaries();
        this.workVacancies = new Array<Vacansy>();
        this.resetInfoWindows();
      }
      else {
        this.switchDangerWindow("You don't have any!");
      }

    }
    else {
      if (this.currentUser.getVacancies().length != 0) {
        this.isWatchingHimself = true;
        this.workSummaries = new Array<Summary>();
        this.workVacancies = this.currentUser.getVacancies();
        this.resetInfoWindows();
      }
      else {
        this.switchDangerWindow("You don't have any!");
      }



    }

  }
  onApply(vacancy:Vacansy) {

    if(this.currentUser.getSummary() != null) {
      if(vacancy.getSummaries().includes(this.currentUser.getSummary())) {
        this.switchDangerWindow("You had already applied to this job!");
      }
      else
      {
        vacancy.addSummary(this.currentUser.getSummary());
        this.onApplyHttpVacancy(vacancy, this.currentUser.getSummary());
        let ind = this.workVacancies.indexOf(vacancy);
        if(ind > -1) {
          this.workVacancies.splice(ind,1);
          this.workVacancies.push(vacancy);
          this.workVacancies = this.workVacancies.sort((n1, n2) => n1.purpose.charCodeAt(0) - n2.purpose.charCodeAt(0));
          this.searchPreferences = "";
          this.isSearchPreferences = false;
          this.switchSuccessWindow("You successfully applied to the vacancy!");
      }
      }
    }
    else {
      this.switchDangerWindow("You don't have summary!");
    }

  }
  onSuggested() {
    this.resetInfoWindows();
    this.isWatchingHimself = false;
      if(this.showVacancies && this.currentUser.getSummary() != null) {
        this.onHttpSuggestedVacancies(this.currentUser.getSummary().getPosition(),this.currentUser.getSummary().getSalary() );
      }
      else if(this.currentUser.getVacancies().length != 0) {
        let array = new Array<Summary>();
        for(let i = 0; i < this.currentUser.getVacancies().length; i++)
        {
          this.httpClient.get(this.serverLocation + "vacansy/suggested/?position=" + this.currentUser.getVacancies()[i].getPurpose()
          ).subscribe(
            (data:any) =>
            {
              for(let i = 0; i < data.length; i++)
              {
                array.push(new Summary(data[i].Name, data[i].Position,data[i].Info,data[i].Salary))
              }

            }

          )

        }
        this.workSummaries = array.sort((n1, n2) => n1.salary - n2.salary);
      }
      else {
        this.switchDangerWindow("You don't have any!");
      }


  }
  onRefresh() {
    this.getHttpVacancies();
    this.getHttpSummaries();
    this.isEditing = false;
    this.searchPreferences = "";
    this.isSearchPreferences = false;
    this.isWatchingHimself = false;
    this.resetInfoWindows();
  }
  onFilterSummaries(position:string,salary:number,sortType:string) {
    this.resetInfoWindows();
    this.isWatchingHimself = false;
    if(salary.toString() == "") {
      salary = this.maxSalary;
    }
    this.onFilterHttpSummaries(position, salary, sortType);
    if (sortType == "Salary") {
      if(salary == this.maxSalary) {
        this.searchPreferences = position + " "  + " by " + sortType;
      }
      else {
        this.searchPreferences = position + " " + salary + " by " + sortType;
      }
      this.isSearchPreferences = true;
    }
    if (sortType == "Name") {
      if(salary.toString() == "") {
        salary = this.maxSalary;
      }
      if(salary == this.maxSalary) {
        this.searchPreferences = position + " "  + " by " + sortType;
      }
      else {
        this.searchPreferences = position + " " + salary + " by " + sortType;
      }
      this.isSearchPreferences = true;
    }
  }
  onFilterVacancies(workName:string, sortType:string, ifRemote:boolean) {
    this.resetInfoWindows();
    this.isWatchingHimself = false;
    this.onFilterHttpVacancies(workName,sortType,ifRemote);
    if (sortType == "Salary") {
      if(workName == "") {
        workName = "All";
      }
      this.searchPreferences = workName + " by " + sortType + " where remote is " + ifRemote;
      this.isSearchPreferences = true;
    }
    if (sortType == "Title") {
      if(workName == "") {
        workName = "All";
      }
      this.searchPreferences = workName + " by " + sortType + " where remote is " + ifRemote;
      this.isSearchPreferences = true;
    }
  }
  onSwitchEditForm() {
    this.isEditing = !this.isEditing;
  }
  onSwitchOpenForm() {
    if(this.currentUser.getType() == TypeOfUser.Admin) {
      this.isAddUserFormStatus = !this.isAddUserFormStatus;
      this.isAddHrFormStatus = !this.isAddHrFormStatus;
    }
    if(this.currentUser.getType() == TypeOfUser.Company) {
      this.isAddHrFormStatus = !this.isAddHrFormStatus;
    }
    if(this.currentUser.getType() == TypeOfUser.User) {
      this.isAddUserFormStatus = !this.isAddUserFormStatus;
    }
  }
  //FunctionalBlock
  RefreshPage() {
    location.reload();
  }
  resetInfoWindows() {
    this.isErrorWindow = false;
    this.isSuccessWindow = false;
  }
  switchSuccessWindow(message:string) {
    this.infoMessage = message;
    this.isSuccessWindow = !this.isSuccessWindow;
    setTimeout(()=>{
      //  this.isErrorWindow = false;
      this.isSuccessWindow = false;
    },1500);
  }
  switchDangerWindow(message:string) {
    this.infoMessage = message;
    this.isErrorWindow = !this.isErrorWindow;
   setTimeout(()=>{
      this.isErrorWindow = false;
      //this.isSuccessWindow = false;
    },1500);
  }
  switchAdmin() {
    this.showVacancies = !this.showVacancies;
  }
  AddSummary(name:string, position:string, info:string, salary:number) {
    if(this.currentUser.getSummary() != null) {
      this.switchDangerWindow("You already have one!");
    }
    else {
      if(name.length < 6) {
        this.switchDangerWindow("Name must be at least 6 characters");
      }
      else if(position.length < 6) {
        this.switchDangerWindow("Position must be at least 6 characters");
      }
      else if(info.length < 6) {
        this.switchDangerWindow("Info must be at least 6 characters");
      }
      else if(salary < 50) {
        this.switchDangerWindow("Salary must be positive and more than 50");
      }
      else {
        this.onRefresh();
        let vc = new Summary(name,position,info,salary);
        this.currentUser.addSummary(vc);
        this.updHttpSummary(vc);
        this.switchSuccessWindow("Summary was successfully added!");
      }


    }

  }
  AddVacancy(purpose:string, salary:number, description:string, ifRemote:boolean) {
   if(salary < 50) {
      this.switchDangerWindow("Salary must be positive and more than 50");
    }
    else if(purpose.length < 6) {
      this.switchDangerWindow("Position must be at least 6 characters");
    }
    else if(description.length < 6) {
      this.switchDangerWindow("Description must be at least 6 characters");
    }

    else {
      this.onRefresh();
      let vc = new Vacansy(purpose,salary,description,ifRemote);

      this.currentUser.addVacancy(vc);
      this.updHttpVacancy(vc);
      this.switchSuccessWindow("You successfully added vacancy!");
    }

  }
  //HttpBlock
  onHttpSuggestedVacancies(purpose:string, salary:number) {
    this.httpClient.get(this.serverLocation + "user/suggested/?position=" + purpose +  "&salary=" + salary
    ).subscribe(
      (data:any) => {
        let tmp = new Array<Vacansy>();
        for(let i = 0; i < data.length; i++) {
          tmp.push(new Vacansy(data[i].Purpose, data[i].Salary,data[i].Description,data[i].Remote))
        }
        this.workVacancies = tmp;
      }
    )
  }
  onFilterHttpSummaries(position:string,salary:number,sortType:string) {
     this.httpClient.get(this.serverLocation + "summary/?position=" + position + "&salary=" + salary + "&sortType=" + sortType
     ).subscribe(
       (data:any) => {
         let tmp = new Array<Summary>();
         for(let i = 0; i < data.length; i++) {
           tmp.push(new Summary(data[i].Name, data[i].Position,data[i].Info,data[i].Salary))
         }
         this.workSummaries = tmp;
       }

     )
   }
  onFilterHttpVacancies(workName:string, sortType:string, ifRemote:boolean) {
   this.httpClient.get(this.serverLocation + "vacansy/?position=" + workName +  "&sortType=" + sortType + "&isRemote=" + ifRemote
   ).subscribe(
     (data:any) => {
       let tmp = new Array<Vacansy>();
       for(let i = 0; i < data.length; i++) {
         tmp.push(new Vacansy(data[i].Purpose, data[i].Salary,data[i].Description,data[i].Remote))
       }
       this.workVacancies = tmp;
     }
   )
 }
  onApplyHttpVacancy(va:Vacansy, sm:Summary) {
    this.httpClient.post(this.serverLocation + "user", {
        summary:sm,
        vacansy:va,
      }).subscribe((data: any) => { console.log(data)});
  }
  updHttpVacancy(va:Vacansy) {
    this.httpClient.post(this.serverLocation + "vacansy",
      {
        name:this.currentUser.getLogin(),
        vacansy:va,
      }).subscribe((data: any) => { console.log(data)});
    this.getHttpSummaries();
    this.getHttpVacancies();
  }
  updHttpSummary(sm:Summary) {
    this.httpClient.post(this.serverLocation + "summary",
      {
        name: this.currentUser.getLogin(),
        summary:sm,
      }).subscribe((data: any) => { console.log(data)});
    this.getHttpSummaries();
    this.getHttpVacancies();
  }
  getHttpSummaries() {
    this.httpClient.get(this.serverLocation + "summary"
    ).subscribe(
      (data:any) => {
        let tmp = new Array<Summary>();
        for(let i = 0; i < data.length; i++) {
          tmp.push(new Summary(data[i].Name, data[i].Position,data[i].Info,data[i].Salary))
        }
        this.workSummaries = tmp;
      }
    )
  }
  getHttpVacancies() {
    this.httpClient.get(this.serverLocation + "vacansy"
    ).subscribe(
      (data:any) =>
      {
        let tmp = new Array<Vacansy>();
        for(let i = 0; i < data.length; i++) {
          let summs = new Array<Summary>();
          if(data[i].OfferedSummarys !=null) {
            for (let j = 0; j < data[i].OfferedSummarys.length; j++) {
              let tmp = new Summary(data[i].OfferedSummarys[j].Name, data[i].OfferedSummarys[j].Position,data[i].OfferedSummarys[j].Info,data[i].OfferedSummarys[j].Salary);
              summs.push(tmp);
            }
          }
          let vc = new Vacansy(data[i].Purpose, data[i].Salary,data[i].Description,data[i].Remote);
          if(data[i].OfferedSummarys !=null) {
            vc.setOfferedSummaries(summs);
          }
          tmp.push(vc);
        }
        this.workVacancies = tmp;
      }

    )
  }

  //GetterBlock
  getAdminStatus() {
    return this.isAdmin;
  }
  getEditingStatus() {
    return this.isEditing;
  }
  getAddFormHrStatus() {
    return this.isAddHrFormStatus;
  }
  getAddFormUserStatus() {
    return this.isAddUserFormStatus;
  }
  getSearchPreferences() {
    return this.searchPreferences;
  }
  getVacancies() {
    return this.workVacancies;
  }
  getAuthorized() {
    return this.isAuthorized;
  }
  getTypeOfUser() {
    return this.showVacancies;
  }
  getSummaries() {
    return this.workSummaries;
  }
  getWatchHimself() {
    return this.isWatchingHimself;
  }
  getSearchStatus() {
    return this.isSearchPreferences;
  }
  getSuccessWindow() {
    return this.isSuccessWindow;
  }
  getDangerWindow() {
    return this.isErrorWindow;
  }
  getInfoMessage() {
    return this.infoMessage;
  }

}

