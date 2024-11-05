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
        auth_range_id: 0,
        comment: "",
        date_from: formatDate(),
        date_to: formatDate(),
        days_of_week: [],
        hour_from: formatTime(),
        hour_to: formatTime(),
        is_active: true
      })

    this.selectedRange = this.ranges.length-1
    this.selectRange(this.ranges.length-1)

  }

  onSubmit(){
    this.ranges[this.selectedRange] = this.rangeForm.value
    this.activeModal.close(this.ranges);
  }

  containsDay(day:string){
    let days: string[] = this.rangeForm.get('days_of_week')?.value
    return days.includes(day)
  }

  close() {
    this.activeModal.close();
  }

  createForm(): FormGroup {
    return this.fb.group({
      auth_range_id: [0],
      date_from: [formatDate(), Validators.required],
      date_to: [formatDate(), Validators.required],
      hour_from: [formatTime(), Validators.required],
      hour_to: [formatTime(), Validators.required],
      days_of_week: [[], Validators.required],
      comment: [""],
      is_active: [true],
    });
  }

  loadForm(authRange: AuthRange) {
    this.rangeForm = this.fb.group({
      auth_range_id: [authRange.auth_range_id],
      date_from: [authRange.date_from, Validators.required],
      date_to: [authRange.date_to, Validators.required],
      hour_from: [authRange.hour_from, Validators.required],
      hour_to: [authRange.hour_to, Validators.required],
      days_of_week: [authRange.days_of_week, Validators.required],
      comment: [authRange.comment],
      is_active: [authRange.is_active],
    });
  }

  toggleDay(day: string, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    const daysArray = this.rangeForm.get('days_of_week')?.value as string[];

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
    this.rangeForm.get('days_of_week')?.setValue(daysArray);
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
