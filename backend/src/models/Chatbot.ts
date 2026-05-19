import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  ForeignKey,
  BelongsTo,
  HasMany,
  Default
} from "sequelize-typescript";
import Queue from "./Queue";
import User from "./User";
import QueueIntegrations from "./QueueIntegrations";
import Files from "./Files";

@Table
class Chatbot extends Model<Chatbot> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @Column
  name: string;

  @Column
  greetingMessage: string;

  @ForeignKey(() => Queue)
  @Column
  queueId: number;

  @BelongsTo(() => Queue)
  queue: any;

  @ForeignKey(() => Chatbot)
  @Column
  chatbotId: number;

  @Column
  isAgent: boolean;

  @BelongsTo(() => Chatbot)
  mainChatbot: any;

  @HasMany(() => Chatbot)
  options: any[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @Column
  queueType: string;

  @ForeignKey(() => Queue)
  @Column
  optQueueId: number;

  @ForeignKey(() => User)
  @Column
  optUserId: number;

  @BelongsTo(() => User)
  user: any;

  @ForeignKey(() => QueueIntegrations)
  @Column
  optIntegrationId: number;

  @BelongsTo(() => QueueIntegrations)
  queueIntegrations: any;

  @ForeignKey(() => Files)
  @Column
  optFileId: number;

  @BelongsTo(() => Files)
  file: any;

  @Default(false)
  @Column
  closeTicket: boolean;
}

export default Chatbot;
