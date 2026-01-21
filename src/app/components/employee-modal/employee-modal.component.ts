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
  validationErrors: { [key: string]: string } = {};
  touched: { [key: string]: boolean } = {};

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
    this.touched = {
      firstName: true,
      lastName: true,
      street: true,
      postcode: true,
      city: true,
      phone: true
    };

    this.validateAllFields();

    if (Object.keys(this.validationErrors).length > 0) {
      return;
    }

    this.save.emit(this.currentEmployee);
  }

  validateField(fieldName: string) {
    this.touched[fieldName] = true;

    switch (fieldName) {
      case 'firstName':
        if (!this.currentEmployee.firstName?.trim()) {
          this.validationErrors['firstName'] = 'Vorname ist erforderlich';
        } else {
          delete this.validationErrors['firstName'];
        }
        break;
      case 'lastName':
        if (!this.currentEmployee.lastName?.trim()) {
          this.validationErrors['lastName'] = 'Nachname ist erforderlich';
        } else {
          delete this.validationErrors['lastName'];
        }
        break;
      case 'street':
        if (!this.currentEmployee.street?.trim()) {
          this.validationErrors['street'] = 'Straße ist erforderlich';
        } else {
          delete this.validationErrors['street'];
        }
        break;
      case 'postcode':
        if (!this.currentEmployee.postcode?.trim()) {
          this.validationErrors['postcode'] = 'Postleitzahl ist erforderlich';
        } else if (!/^\d{5}$/.test(this.currentEmployee.postcode.trim())) {
          this.validationErrors['postcode'] = 'Bitte geben Sie eine gültige 5-stellige PLZ ein';
        } else {
          delete this.validationErrors['postcode'];
        }
        break;
      case 'city':
        if (!this.currentEmployee.city?.trim()) {
          this.validationErrors['city'] = 'Stadt ist erforderlich';
        } else {
          delete this.validationErrors['city'];
        }
        break;
      case 'phone':
        if (!this.currentEmployee.phone?.trim()) {
          this.validationErrors['phone'] = 'Telefonnummer ist erforderlich';
        } else if (!/^[0-9+\-\s()]+$/.test(this.currentEmployee.phone.trim())) {
          this.validationErrors['phone'] = 'Bitte geben Sie eine gültige Telefonnummer ein';
        } else {
          delete this.validationErrors['phone'];
        }
        break;
    }
  }

  validateAllFields() {
    this.validationErrors = {};

    if (!this.currentEmployee.firstName?.trim()) {
      this.validationErrors['firstName'] = 'Vorname ist erforderlich';
    }
    if (!this.currentEmployee.lastName?.trim()) {
      this.validationErrors['lastName'] = 'Nachname ist erforderlich';
    }
    if (!this.currentEmployee.street?.trim()) {
      this.validationErrors['street'] = 'Straße ist erforderlich';
    }
    if (!this.currentEmployee.postcode?.trim()) {
      this.validationErrors['postcode'] = 'Postleitzahl ist erforderlich';
    } else if (!/^\d{5}$/.test(this.currentEmployee.postcode.trim())) {
      this.validationErrors['postcode'] = 'Bitte geben Sie eine gültige 5-stellige PLZ ein';
    }
    if (!this.currentEmployee.city?.trim()) {
      this.validationErrors['city'] = 'Stadt ist erforderlich';
    }
    if (!this.currentEmployee.phone?.trim()) {
      this.validationErrors['phone'] = 'Telefonnummer ist erforderlich';
    } else if (!/^[0-9+\-\s()]+$/.test(this.currentEmployee.phone.trim())) {
      this.validationErrors['phone'] = 'Bitte geben Sie eine gültige Telefonnummer ein';
    }
  }

  hasError(fieldName: string): boolean {
    return this.touched[fieldName] && !!this.validationErrors[fieldName];
  }

  getError(fieldName: string): string {
    return this.validationErrors[fieldName] || '';
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
