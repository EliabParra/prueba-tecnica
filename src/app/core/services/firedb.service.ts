import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';

@Injectable({
  providedIn: 'root'
})
export class FireDBService {

  constructor (
    private db: AngularFireDatabase
  ) { }

  url: string = 'https://eliab-prueba-tecnica-default-rtdb.firebaseio.com/'

  getOneById(id: string, collection: string): any {
    try {
      const result = this.db.object(`${collection}/${id}`)
      const data = result.snapshotChanges()
      return data
    } catch (err) {
      console.error('Error al obtener el registro', err)
    }
  }

  getAll(collection: string): any {
    try {
      const result = this.db.list(collection)
      const data = result.snapshotChanges()
      return data
    } catch (err) {
      console.error('Error al obtener los registros', err)
    }
  }

  async create(collection: string, data: object): Promise<any> {
    try {
      const payload: any = { ...data };
      if (payload.id === undefined) delete payload.id;

      const ref = await this.db.list(collection).push(payload);
      const id = ref.key;
      if (!id) throw new Error('No se pudo obtener la clave del nuevo registro');

      const dataWithKey = Object.assign({}, payload, { id });
      await ref.set(dataWithKey);
      return dataWithKey;
    } catch (err) {
      console.error('Error al crear el registro', err)
    }
  }

  update(collection: string, id: string, data: object): any {
    try {
      this.db.object(`${collection}/${id}`).update(data)
      return data
    } catch (err) {
      console.error('Error al actualizar el registro', err)
    }
  }

  async delete(collection: string, id: string): Promise<string> {
    try {
      await this.db.object(`${collection}/${id}`).remove()
      return id
    } catch (err) {
      console.error('Error al eliminar el registro', err)
    }
  }
}
