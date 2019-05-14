import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { NguCarousel, NguCarouselConfig } from '@ngu/carousel';
import { AuthenticationService } from '../../../shared/services/auth/authentication.service'
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import {MatSort, MatTableDataSource, MatPaginator} from '@angular/material';
import { NgbModalConfig, NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-portfolio-carousel',
  templateUrl: './portfolio-carousel.component.html',
  styleUrls: ['./portfolio-carousel.component.scss']
})
export class PortfolioCarouselComponent implements OnInit {
  @Input('backgroundGray') public backgroundGray;

  dataSource: any = [] 
  dataSourceMat: any
  displayedColumns: string[] = []
  displayedColumns1: Array<{field: string, label: string}> = []

  items_page_order: Array<any> = []
  view_display_order: Array<any> = []
  insert_display_order: Array<any> = []
  fields: any = []
  addForm: FormGroup
  mode: number;
  index: string;
  view_index: string = ''
  objects: any
  object_ids: Array<string> = []

  submitted: boolean;
  loading_submit: boolean;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private authentic: AuthenticationService, private formBuilder: FormBuilder, config: NgbModalConfig, private modalService: NgbModal) { }

  ngOnInit() {

    this.authentic.get_object_fields('lead').subscribe( res=>{
      this.fields = res

      this.sort_fields_by('items_page_order')
      for (let field of this.fields){
        if(field.items_page_order != '0')
        { 
          this.items_page_order.push(field)
          this.displayedColumns.push(this.remove__c(field.name))
          this.displayedColumns1.push({field: this.remove__c(field.name), label: field.label})
        }
      }

      this.sort_fields_by('view_display_order')
      for (let field of this.fields){
        if(field.view_display_order != '0' && field.type != 'root')
          this.view_display_order.push(field)
      }

      this.sort_fields_by('insert_display_order')
      for (let field of this.fields){
        if(field.insert_display_order != '0')
          this.insert_display_order.push(field)
      }

      //===== Initialize Add Form ===============
      this.addForm = this.formBuilder.group({})
      for (let field of this.insert_display_order)
      {
        let control_name = ''
        //=== Check Type If root 
        if( field.type != 'root' )
        {
          control_name = this.remove__c(field.name)
        }
        else
        {
          continue;
        }
        
        //=== Add Control to Add Form 
        
        let validator = []
        if( field.nillable == 0)
        {
          validator.push(Validators.required)
        } 
        if( field.length > 0 )
        {
          validator.push(Validators.maxLength(field.length))
        }
        if( field.type == 'double')
        {
          validator.push(Validators.maxLength(5))
        }
        this.addForm.addControl(control_name, new FormControl('', validator))
      }
      //===== Get All Objects ===================
      this.authentic.login().subscribe(res => {
        this.render_object()
      })  
    });  
  }

  render_object(){
    this.authentic.get_objects('lead').subscribe(res => {
      if(res.hasOwnProperty('data')){
        this.objects = res
        let data = res.data
        this.object_ids = []
        this.dataSource = []
        for(var key in data) {
            this.object_ids.push(key)
        }
        for(let key in data){
          let source = {}
          for(let item of this.items_page_order){
            source[this.remove__c(item.name)] = data[key][this.remove__c(item.name)]
          }
          this.dataSource.push(source)
        }
        this.dataSourceMat = new MatTableDataSource(this.dataSource);
        this.dataSourceMat.paginator = this.paginator; 
      }
    }) 
  }

  onSubmit() {
    this.submitted = true;
    // stop here if form is invalid
    if (this.addForm.invalid || this.addForm.errors != null) {
      return;
    }
    this.loading_submit = true;

    for( let field in this.addForm.controls )
    {
      if(this.f[field].value === true)
      {
        this.f[field].setValue('true');
      }
      else if(this.f[field].value === false)
      {
        this.f[field].setValue('false');
      }
    }

    if(this.mode == 0)
    {

      this.addForm.addControl('Organization_Info', this.formBuilder.control(''));
      let root_value = environment.org_id; //temporary
      this.f['Organization_Info'].setValue(root_value);

      let request_form = [{"id": "", "data": this.addForm.value}];
      console.log(request_form)
      // Call Add API
      // this.authentic.add_object(request_form, 'lead').subscribe( res => {
      //   res = res[0];
                
      //   if(res['status'] == "success")
      //   { 
      //       this.modalService.dismissAll();
      //       this.render_object();
      //   }  
      //   else
      //   {

      //   }
      //   this.loading_submit = false;
      // })

      this.addForm.removeControl('Organization_Info'); 
    }
  }


  applyFilter(filterValue: string) {
    this.dataSourceMat.filter = filterValue.trim().toLowerCase();
  }

  remove__c(string){
    return string.trim().replace(/\__c/gi, "");
  }

  sort_fields_by(key){
    if ( key == 'items_page_order' )
    {
      this.fields.sort((n1, n2) => {
        return this.naturalCompare(n1.items_page_order.toString(), n2.items_page_order.toString());
      });
    }
    else if ( key == 'view_display_order' )
    {
      this.fields.sort((n1, n2) => {
        return this.naturalCompare(n1.view_display_order.toString(), n2.view_display_order.toString());
      });
    }
    else if ( key == 'insert_display_order' )
    {
      this.fields.sort((n1, n2) => {
        return this.naturalCompare(n1.insert_display_order.toString(), n2.insert_display_order.toString());
      });
    }
  }

  naturalCompare(a, b) {
    var ax = [], bx = [];
 
    a.replace(/(\d+)|(\D+)/g, function (_, $1, $2) { ax.push([$1 || Infinity, $2 || ""]) });
    b.replace(/(\d+)|(\D+)/g, function (_, $1, $2) { bx.push([$1 || Infinity, $2 || ""]) });
 
    while (ax.length && bx.length) {
      var an = ax.shift();
      var bn = bx.shift();
      var nn = (an[0] - bn[0]) || an[1].localeCompare(bn[1]);
      if (nn) return nn;
    }
 
    return ax.length - bx.length;
  }

  open(content, mode, index = '') {
    this.modalService.dismissAll();
    this.mode = mode;
    this.index = index;
    if (mode == 0) // create modal
    {
      if(index == '')
        this.set_values(null)
      else
        this.set_values(index)
    }
    else if (mode == 1) // show modal
    {
      this.view_index = index
    }
    this.modalService.open(content, { size: 'lg' })
  }

  set_values(index){
    if (index == null)
    {
      for( let field in this.addForm.controls)
      {
        if(this.get_field_type(field) == 'boolean')
          this.f[field].setValue('false');
        else
          this.f[field].setValue('');
      }
    }
    else
    {
      for( let field in this.addForm.controls)
      {
        this.f[field].setValue(this.objects.data[index][field]);
      }
    }
  }

  get f() { return this.addForm.controls; }

  print(control_name, err){
    if(err.hasOwnProperty('maxlength')){
      return `${control_name} has wrong length! Required length: ${err.maxlength.requiredLength}`;
    }
    else if(err.hasOwnProperty('required')){
      return `${control_name} is required!`;
    }
  }
  
  get_field_type(string){
    for(let item of this.insert_display_order){
      if(string == this.remove__c(item.name)){
        return item.type;
      }
    }
    return '';
  }
  make_picklist(string){
    return string.split('||');
  }
}
