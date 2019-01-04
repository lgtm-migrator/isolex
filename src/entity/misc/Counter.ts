import { isNil } from 'lodash';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export interface CounterOptions {
  count: number;
  name: string;
  roomId: string;
}

export const TABLE_COUNTER = 'counter';

@Entity(TABLE_COUNTER)
export class Counter implements CounterOptions {
  @PrimaryGeneratedColumn('uuid')
  public id: string = '';

  @Column()
  public count: number = 0;

  @Column()
  public name: string = '';

  @Column()
  public roomId: string = '';

  public toJSON() {
    return {
      count: this.count,
      id: this.id,
      name: this.name,
      roomId: this.roomId,
    };
  }
}
