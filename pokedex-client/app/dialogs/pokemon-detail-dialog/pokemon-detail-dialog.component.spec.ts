import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PokemonMoveComponent } from '@components/pokemon-move/pokemon-move.component';
import { PokemonSummaryComponent } from '@components/pokemon-summary/pokemon-summary.component';
import { DetailDialogLoadingComponent } from '@dialogs/detail-dialog-loading/detail-dialog-loading.component';
import { PokemonDetail } from '@models/pokemon-detail';
import { PokedexService } from '@services/pokedex.service';
import { ChartsModule } from 'ng2-charts';
import { of } from 'rxjs';
import { PokemonDetailDialogComponent } from './pokemon-detail-dialog.component';

describe('PokemonDetailDialogComponent', () => {
  let component: PokemonDetailDialogComponent;
  let fixture: ComponentFixture<PokemonDetailDialogComponent>;

  const serviceSpy = jasmine.createSpyObj('PokedexService', ['getPokemon']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        PokemonDetailDialogComponent,
        DetailDialogLoadingComponent,
        PokemonSummaryComponent,
        PokemonMoveComponent
      ],
      imports: [
        HttpClientTestingModule,
        ChartsModule,
        MatCardModule,
        MatDialogModule,
        MatIconModule,
        MatTabsModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: {} },
        { provide: PokedexService, useValue: serviceSpy }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PokemonDetailDialogComponent);
    component = fixture.componentInstance;
    const expected: PokemonDetail = {
      id: 1,
      name: 'bulbasuar',
      sprites: { front_default: '' },
      types: [{ slot: 0, type: { name: '', url: '' } }],
      stats: [],
      moves: [],
      abilities: []
    };
    serviceSpy.getPokemon.and.returnValue(of(expected));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
