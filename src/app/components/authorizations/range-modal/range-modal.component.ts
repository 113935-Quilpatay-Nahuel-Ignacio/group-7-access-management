import {Component, Input, OnInit} from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {AuthRange} from "../../../models/authorize.model";

@Component({
  selector: 'app-range-modal',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './range-modal.component.html',
  styleUrl: './range-modal.component.css'
})
export class RangeModalComponent implements OnInit{
  constructor(private activeModal: NgbActiveModal, private fb: FormBuilder) {}
  @Input() ranges: AuthRange[] = []
  rangeForm: FormGroup = {} as FormGroup;
  previousRange: number = 0;
  selectedRange: number = 0;

  daysOfWeek = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];


  ngOnInit() {
    if (this.ranges.length == 0) {
    this.rangeForm = this.createForm();
    this.addRange()
    } else {
      this.loadForm(this.ranges[0])
    }
    console.log(this.ranges)
  }

  selectRangeEvent(){
    this.selectRange(this.selectedRange)
  }
  selectRange(index: number){
    this.ranges[this.previousRange] = this.rangeForm.value
    this.previousRange = index;
    this.loadForm(this.ranges[index])
    console.log(this.ranges)
  }

  addRange(){
    this.ranges.push(
      {
        authRangeId: 0,
        comment: "",
        dateFrom: formatDate(),
        dateTo: formatDate(),
        daysOfWeek: [],
        hourFrom: formatTime(),
        hourTo: formatTime(),
        isActive: true
      })

    this.selectedRange = this.ranges.length-1
    this.selectRange(this.ranges.length-1)

  }

  onSubmit(){
    this.ranges[this.selectedRange] = this.rangeForm.value
    this.activeModal.close(this.ranges);
  }

  containsDay(day:string){
    let days: string[] = this.rangeForm.get('daysOfWeek')?.value
    return days.includes(day)
  }

  close() {
    this.activeModal.close();
  }

  createForm(): FormGroup {
    return this.fb.group({
      authRangeId: [0],
      dateFrom: [formatDate(), Validators.required],
      dateTo: [formatDate(), Validators.required],
      hourFrom: [formatTime(), Validators.required],
      hourTo: [formatTime(), Validators.required],
      daysOfWeek: [[], Validators.required],
      comment: [""],
      isActive: [true],
    });
  }

  loadForm(authRange: AuthRange) {
    this.rangeForm = this.fb.group({
      authRangeId: [authRange.authRangeId],
      dateFrom: [authRange.dateFrom, Validators.required],
      dateTo: [authRange.dateTo, Validators.required],
      hourFrom: [authRange.hourFrom, Validators.required],
      hourTo: [authRange.hourTo, Validators.required],
      daysOfWeek: [authRange.daysOfWeek, Validators.required],
      comment: [authRange.comment],
      isActive: [authRange.isActive],
    });
  }

  toggleDay(day: string, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    const daysArray = this.rangeForm.get('daysOfWeek')?.value as string[];

    if (checked) {
      // Agregar el día si está marcado
      if (!daysArray.includes(day)) {
        daysArray.push(day);
      }
    } else {
      // Quitar el día si no está marcado
      const index = daysArray.indexOf(day);
      if (index > -1) {
        daysArray.splice(index, 1);
      }
    }

    // Actualizar el control del formulario
    this.rangeForm.get('daysOfWeek')?.setValue(daysArray);
  }
}
function formatDate() {
  const today = new Date();
  return today.toISOString().split('T')[0]
}
function formatTime(){
  const today = new Date();
  const hours = today.getHours().toString().padStart(2, '0'); // 00-23
  const minutes = today.getMinutes().toString().padStart(2, '0'); // 00-59
  return `${hours}:${minutes}`; // HH:mm

}
