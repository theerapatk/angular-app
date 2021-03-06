import { Component } from '@angular/core';
import { AuthenticationService } from '@services/authentication.service';

@Component({
  selector: 'app-account-settings',
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.scss']
})
export class AccountSettingsComponent {

  isLoading = true;

  constructor(
    public authService: AuthenticationService
  ) { }

  buildData(fieldName = ''): { _id: string, fieldName: string, value: string } {
    const { _id, email, name } = this.authService.currentUser;
    const data = { _id, fieldName, value: '' };
    if (fieldName === 'email') {
      data.value = email;
    } else if (fieldName === 'name') {
      data.value = name;
    }
    return data;
  }

}
