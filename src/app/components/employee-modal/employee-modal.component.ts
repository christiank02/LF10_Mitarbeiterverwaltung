import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {Employee, Skill} from '../../Employee';

@Component({
  selector: 'app-employee-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-modal.component.html',
  styleUrl: './employee-modal.component.css'
})
export class EmployeeModalComponent implements OnChanges {
  @Input() show = false;
  @Input() isEditMode = false;
  @Input() employee: Employee | null = null;
  @Input() availableQualifications: Skill[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Employee>();

  currentEmployee: Employee = {
    firstName: '',
    lastName: '',
    city: '',
    street: '',
    postcode: '',
    phone: '',
    skillSet: []
  };

  selectedQualificationToAdd = '';

  ngOnChanges(changes: SimpleChanges) {
    if (changes['employee'] && this.employee) {
      this.currentEmployee = {
        id: this.employee.id,
        firstName: this.employee.firstName,
        lastName: this.employee.lastName,
        street: this.employee.street,
        postcode: this.employee.postcode,
        city: this.employee.city,
        phone: this.employee.phone,
        skillSet: this.employee.skillSet ? [...this.employee.skillSet] : []
      };
    } else if (changes['show'] && this.show && !this.isEditMode) {
      this.currentEmployee = {
        firstName: '',
        lastName: '',
        city: '',
        street: '',
        postcode: '',
        phone: '',
        skillSet: []
      };
      this.selectedQualificationToAdd = '';
    }
  }

  onClose() {
    this.close.emit();
  }

  onSave() {
    if (!this.currentEmployee.firstName?.trim() || !this.currentEmployee.lastName?.trim()) {
      alert('Please fill in at least first name and last name');
      return;
    }
    this.save.emit(this.currentEmployee);
  }

  addQualificationFromDropdown() {
    if (this.selectedQualificationToAdd && this.selectedQualificationToAdd.trim()) {
      if (!this.currentEmployee.skillSet) {
        this.currentEmployee.skillSet = [];
      }

      const qualification = this.availableQualifications.find(
        q => q.skill === this.selectedQualificationToAdd
      );

      if (qualification && qualification.id !== undefined) {
        const alreadyExists = this.currentEmployee.skillSet.some(
          skill => skill.skill === this.selectedQualificationToAdd
        );

        if (!alreadyExists) {
          this.currentEmployee.skillSet.push({
            skill: this.selectedQualificationToAdd,
            id: qualification.id
          });
        }
      }

      this.selectedQualificationToAdd = '';
    }
  }

  removeQualification(skillName: string) {
    if (this.currentEmployee.skillSet) {
      this.currentEmployee.skillSet = this.currentEmployee.skillSet.filter(
        skill => skill.skill !== skillName
      );
    }
  }

  isQualificationSelected(skillName: string): boolean {
    return this.currentEmployee.skillSet?.some(skill => skill.skill === skillName) || false;
  }
}
