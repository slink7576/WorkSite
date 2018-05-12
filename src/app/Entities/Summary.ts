export class Summary {
  name:string;
  position:string;
  info:string;
  salary:number;
  constructor(name:string, position:string, info:string, salary:number) {
    this.name = name;
    this.position = position;
    this.info = info;
    this.salary = salary;
  }
  getName() {
    return this.name;
  }
  getPosition() {
    return this.position;
  }
  getInfo() {
    return this.info;
  }
  toString() {
    return this.name + " " + this.position;
  }
  getSalary() {
    return this.salary;
  }

}
