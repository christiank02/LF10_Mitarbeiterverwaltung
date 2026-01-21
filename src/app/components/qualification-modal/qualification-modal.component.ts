import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {Skill} from "../../Employee";

@Component({
  selector: 'app-qualification-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './qualification-modal.component.html',
  styleUrl: './qualification-modal.component.css'
})
export class QualificationModalComponent implements OnChanges {
  @Input() show = false;
  @Input() isEditMode = false;
  @Input() qualification: Skill | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Skill>();

  @ViewChild('skillInput') skillInput!: ElementRef;

  currentQualification: Skill = { skill: '' };
  validationErrors: { [key: string]: string } = {};
  touched: { [key: string]: boolean } = {};

  ngOnChanges(changes: SimpleChanges) {
    if (changes['qualification'] && this.qualification) {
      this.currentQualification = { ...this.qualification };
    } else if (changes['show'] && this.show && !this.isEditMode) {
      this.currentQualification = { skill: '' };
      this.validationErrors = {};
      this.touched = {};
    }

    if (changes['show'] && this.show) {
      setTimeout(() => {
        this.skillInput?.nativeElement?.focus();
      }, 100);
    }
  }

  onClose() {
    this.close.emit();
  }

  onSave() {
    this.touched['skill'] = true;
    this.validateField('skill');

    if (Object.keys(this.validationErrors).length > 0) {
      return;
    }

    this.save.emit(this.currentQualification);
  }

  validateField(fieldName: string) {
    this.touched[fieldName] = true;

    if (fieldName === 'skill') {
      if (!this.currentQualification.skill?.trim()) {
        this.validationErrors['skill'] = 'Qualifikationsname ist erforderlich';
      } else if (this.currentQualification.skill.trim().length < 2) {
        this.validationErrors['skill'] = 'Qualifikationsname muss mindestens 2 Zeichen lang sein';
      } else {
        delete this.validationErrors['skill'];
      }
    }
  }

  hasError(fieldName: string): boolean {
    return this.touched[fieldName] && !!this.validationErrors[fieldName];
  }

  getError(fieldName: string): string {
    return this.validationErrors[fieldName] || '';
  }
}

