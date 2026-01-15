# Employee Modal Component

Eine wiederverwendbare Modal-Komponente für das Hinzufügen und Bearbeiten von Mitarbeitern.

## Verwendung

### Import
```typescript
import { EmployeeModalComponent } from '../components/employee-modal/employee-modal.component';

@Component({
  // ...
  imports: [CommonModule, FormsModule, EmployeeModalComponent],
})
```

### Template
```html
<app-employee-modal
  [show]="showModal"
  [isEditMode]="isEditMode"
  [employee]="employeeToEdit"
  [availableQualifications]="qualifications"
  (close)="onModalClose()"
  (save)="onEmployeeSave($event)"
></app-employee-modal>
```

## Input Properties

| Property | Type | Beschreibung |
|----------|------|--------------|
| `show` | `boolean` | Steuert die Sichtbarkeit des Modals |
| `isEditMode` | `boolean` | `true` für Bearbeitungsmodus, `false` für Hinzufügen-Modus |
| `employee` | `Employee \| null` | Der zu bearbeitende Mitarbeiter (nur im Edit-Modus) |
| `availableQualifications` | `Qualification[]` | Liste der verfügbaren Qualifikationen |

## Output Events

| Event | Payload | Beschreibung |
|-------|---------|--------------|
| `close` | `void` | Wird ausgelöst, wenn das Modal geschlossen wird |
| `save` | `Employee` | Wird ausgelöst, wenn der Benutzer auf "Speichern" klickt |

## Features

- **Add-Modus**: Erstellt einen neuen Mitarbeiter mit optionalen Qualifikationen
- **Edit-Modus**: Bearbeitet einen vorhandenen Mitarbeiter (ohne Qualifikations-Management)
- **Icon-Unterscheidung**: 
  - Add-Modus: `bi-person-plus` Icon
  - Edit-Modus: `bi-pencil-square` Icon
- **Responsive Design**: Optimiert für verschiedene Bildschirmgrößen
- **Validierung**: Pflichtfelder für Vor- und Nachname

## Beispiel

### Employee List Komponente
```typescript
export class EmployeeListComponent {
  showAddEmployeeModal = false;
  isEditMode = false;
  currentEmployee: Employee | null = null;
  availableQualifications: Qualification[] = [];

  addEmployee() {
    this.isEditMode = false;
    this.currentEmployee = null;
    this.fetchAvailableQualifications();
    this.showAddEmployeeModal = true;
  }

  editEmployee(employee: Employee) {
    this.isEditMode = true;
    this.currentEmployee = employee;
    this.fetchAvailableQualifications();
    this.showAddEmployeeModal = true;
  }

  onEmployeeSave(employee: Employee) {
    // Speicher-Logik hier implementieren
    // ...
    this.showAddEmployeeModal = false;
  }
}
```

### Employee Details Komponente
```typescript
export class EmployeeDetailsComponent {
  showEditModal = false;
  employee: Employee | null = null;
  availableQualifications: Qualification[] = [];

  editEmployee() {
    if (!this.employee) return;
    this.fetchAvailableQualifications();
    this.showEditModal = true;
  }

  onEmployeeSave(employee: Employee) {
    // Update-Logik hier implementieren
    // ...
    this.showEditModal = false;
  }
}
```

## Styling

Die Komponente verwendet Bootstrap-Klassen und benutzerdefinierte CSS-Animationen:
- Fade-in Animation für den Backdrop
- Slide-down Animation für das Modal
- Scrollbares Modal-Body (max-height: 60vh)

## Hinweise

- Im **Edit-Modus** wird das Qualifikations-Management ausgeblendet, da es einen dedizierten Bereich dafür gibt
- Im **Add-Modus** können Qualifikationen direkt über ein Dropdown hinzugefügt werden
- Die Komponente validiert automatisch, dass First Name und Last Name ausgefüllt sind

