import { Field, ObjectType, registerEnumType } from '@nestjs/graphql'
import { AuthProvider } from 'src/utils/auth-provider.enum'
import { Column, Entity, PrimaryColumn } from 'typeorm'

registerEnumType(AuthProvider, { name: 'AuthProvider' })

@Entity()
@ObjectType()
export class User {
  @PrimaryColumn()
  @Field()
  id: string

  @Column()
  @Field()
  username: string

  @Column()
  @Field()
  email: string

  @Column({ nullable: true })
  @Field({ nullable: true })
  password?: string

  @Column({ type: 'enum', enum: AuthProvider })
  @Field(() => AuthProvider)
  provider: AuthProvider

  @Column({ unique: true, nullable: true })
  @Field({ nullable: true })
  providerId?: string

  @Column({ nullable: true })
  @Field({ nullable: true })
  imagePath?: string
}
