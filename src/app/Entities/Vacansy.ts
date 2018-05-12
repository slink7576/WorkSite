import {Summary} from "./Summary";
export class Vacansy
{
  purpose:string;
  salary:number;
  description:string;
  remote:boolean;
  offeredSummaries:Array<Summary>;
  constructor(purpose, salary, description, remote) {
      this.description = description;
      this.salary = salary;
      this.purpose = purpose;
      this.remote = remote;
      this.offeredSummaries = new Array<Summary>();
  }
  addSummary(sm:Summary) {
    if(sm!=null) {
      this.offeredSummaries.push(sm);
    }
  }
  setOfferedSummaries(arr:Array<Summary>) {
    this.offeredSummaries = arr;
  }
  getSummaries() {
  return this.offeredSummaries;
}
  getPurpose() {
  return this.purpose;
}
  getSalary() {
  return this.salary;
}
  getDescription() {
  return this.description;
}
  getRemoteBool() {
  return this.remote;
}
  getRemote() {
  if(this.remote)
  {
    return "Remote work";
  }
  else{
    return "";
  }
}
}
