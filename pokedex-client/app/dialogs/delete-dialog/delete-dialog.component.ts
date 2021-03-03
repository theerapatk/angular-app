import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User } from '@models/user.model';
import { UserService } from '@services/user.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-delete-dialog',
  templateUrl: './delete-dialog.component.html',
  styleUrls: ['./delete-dialog.component.scss']
})
export class DeleteDialogComponent {

  isLoading = false;
  errorMessage = 'Cannot delete this entity, please try again later.';

  constructor(
    private userService: UserService,
    private toastrService: ToastrService,
    public dialogRef: MatDialogRef<DeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      title?: string,
      content?: string,
      dataType?: string,
      row?: User
    }
  ) { }

  onDeleteClicked(): void {
    this.isLoading = true;
    this.deleteUser();
  }

  deleteUser(): void {
    const entity = this.data.row as User;
    this.userService.deleteUser(entity._id as string).subscribe(
      response => this.handleSuccess(entity.email as string),
      errorResponse => this.handleError(errorResponse)
    );
  }

  private handleSuccess(entityId: string): void {
    this.isLoading = false;
    this.dialogRef.close({ success: true, entityId });
  }

  private handleError(errorResponse: any): void {
    this.isLoading = false;
    this.toastrService.warning(errorResponse?.error?.error?.message || this.errorMessage);
  }

}
