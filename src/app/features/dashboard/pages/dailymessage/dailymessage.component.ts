import { Component, ViewChild, AfterViewInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

import { TokenService } from '../../../../core/services/token.service';
import { MatCardModule } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';


type Row = {
  id: number;
  nombre: string;
  email: string;
  estado: 'Activo' | 'Inactivo';
};


@Component({
  selector: 'app-dailymessage',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatDividerModule,MatFormFieldModule,MatIconModule,MatInputModule,
    ReactiveFormsModule, MatButtonModule,
    MatTableModule, MatPaginatorModule, MatSortModule],
  templateUrl: './dailymessage.component.html',
  styleUrl: './dailymessage.component.scss'
})
export class DailymessageComponent {
  private token = inject(TokenService);
  claims = computed(() => this.token.getClaims());



displayedColumns = ['id', 'nombre', 'email', 'estado', 'acciones'];
  dataSource = new MatTableDataSource<Row>(crearFakerows(10)); // data ficticia
  search = new FormControl<string>('', { nonNullable: true });
  total = signal(this.dataSource.data.length);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // filtro por todas las columnas
    this.dataSource.filterPredicate = (row, filtro) => {
      const txt = `${row.id} ${row.nombre} ${row.email} ${row.estado}`.toLowerCase();
      return txt.includes(filtro.trim().toLowerCase());
    };

    this.search.valueChanges.subscribe(v => {
      this.dataSource.filter = v || '';
      // reinicia a página 0 para evitar páginas vacías
      this.paginator?.firstPage();
      this.total.set(this.dataSource.filteredData.length);
    });
  }

  limpiarBusqueda() {
    this.search.setValue('');
  }
}

// --------- Data ficticia ----------
function crearFakerows(n: number): Row[] {
  const nombres = ['Andrés','Sofía','Carlos','María','Juan','Laura','Felipe','Valentina','Camilo','Diana'];
  return Array.from({ length: n }).map((_, i) => {
    const nombre = nombres[i % nombres.length] + ' ' + String.fromCharCode(65 + (i % 26)) + '.';
    return {
      id: i + 1,
      nombre,
      email: nombre.toLowerCase().replace(/\s+/g, '.') + '@example.com',
      estado: i % 3 === 0 ? 'Inactivo' : 'Activo'
    };
  });
}




