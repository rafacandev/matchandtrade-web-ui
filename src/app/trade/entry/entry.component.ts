import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { LoadingAndMessageBannerSupport } from 'src/app/class/util/loading-and-error-support';
import { MembershipService } from 'src/app/service/membership.service';
import { NavigationService } from '../../service/navigation.service';
import { Trade } from '../../class/pojo/trade';
import { TradeService } from '../../service/trade.service';
import { Membership, MembershipType } from 'src/app/class/pojo/membership';

@Component({
  selector: 'app-trade-list',
  templateUrl: './entry.component.html',
  styleUrls: ['./entry.component.scss'],
  providers: [TradeService]
})
export class EntryComponent extends LoadingAndMessageBannerSupport implements OnInit {
  descriptionFormControl: AbstractControl;
  nameFormControl: AbstractControl;
  trade: Trade = new Trade();
  tradeFormGroup: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private membershipService: MembershipService,
    private navigationService: NavigationService,
    private route: ActivatedRoute,
    private tradeService: TradeService) {
    super();
  }

  async ngOnInit() {
    const tradeHref = this.navigationService.obtainData(this.route).tradeHref;
    if (tradeHref) {
      await this.loadExistingTrade(tradeHref);
    } else {
      this.buildForm();
      this.populateForm();  
    }
    this.loading = false;
  }

  private buildForm(): void {
    this.tradeFormGroup = this.formBuilder.group({
      'description': ['', Validators.compose([this.descriptionValidator])],
      'name': ['', Validators.compose([Validators.required, this.nameValidator])],
      'state': []
    });
    this.descriptionFormControl = this.tradeFormGroup.controls['description'];
    this.nameFormControl = this.tradeFormGroup.controls['name'];
  }

  private descriptionValidator(control: FormControl): { [s: string]: boolean } {
    if (control.value && (control.value.length < 3 || control.value.length > 1000)) {
      return { invalid: true };
    }
  }

  private async loadExistingTrade(tradeHref: string): Promise<void> {
    try {
      this.trade = await this.tradeService.find(tradeHref);
      this.buildForm();
      this.populateForm();
      // Disable form if autheticated user is not the trade owner
      const membership: Membership = await this.membershipService.findByTradeId(this.trade.tradeId);
      if (!membership || membership.type != MembershipType.OWNER) {
        this.tradeFormGroup.disable();
      }
    } catch (e) {
      this.showErrorMessage(e);
    }
  }

  private loadTradeFromForm() {
    this.trade.name = this.nameFormControl.value;
    this.trade.description = this.descriptionFormControl.value;
    // Sanitize description, empty string must be treated as undefined or we get server error: description must be bigger than 3 chars
    if (this.trade.description != null) {
      if (this.trade.description.length == 0) {
        this.trade.description = undefined;
      } else {
        this.trade.description = this.trade.description.trim();
      }
    }
  }

  private nameValidator(control: FormControl): { [s: string]: boolean } {
    if (control.value && (control.value.length < 3 || control.value.length > 150)) {
      return { invalid: true };
    }
  }

  async onSubmit() {
    this.loading = true;
    try {
      this.loadTradeFromForm();
      this.trade = await this.tradeService.save(this.trade);
      this.showInfoMessage('Trade saved', 'save');
    } catch (e) {
      this.showErrorMessage(e);
    }
    this.loading = false;
  }

  private populateForm() {
    this.nameFormControl.setValue(this.trade.name);
    this.descriptionFormControl.setValue(this.trade.description);
  }
}
