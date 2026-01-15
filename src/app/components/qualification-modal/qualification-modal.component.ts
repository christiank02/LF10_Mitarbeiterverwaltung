import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
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

  currentQualification: Skill = { skill: '' };

  ngOnChanges(changes: SimpleChanges) {
    if (changes['qualification'] && this.qualification) {
      this.currentQualification = { ...this.qualification };
    } else if (changes['show'] && this.show && !this.isEditMode) {
      this.currentQualification = { skill: '' };
    }
  }

  onClose() {
    this.close.emit();
  }

  onSave() {
    if (!this.currentQualification.skill.trim()) {
      alert('Bitte geben Sie einen Qualifikationsnamen ein');
      return;
    }
    this.save.emit(this.currentQualification);
  }
}

