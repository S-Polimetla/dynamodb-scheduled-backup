import {
  DynamoDBClient,
  ListTablesCommand,
  CreateBackupCommand,
  CreateBackupCommandInput,
} from "@aws-sdk/client-dynamodb";

const client: DynamoDBClient = new DynamoDBClient({
  region: process.env.REGION,
});

export async function handler() {
  const tables = await listTables();
  if (tables) {
    await backupAll(tables);
  }
}

async function listTables(): Promise<string[]> {
  const command: ListTablesCommand = new ListTablesCommand({});
  try {
    const results: any = await client.send(command);
    if (results.TableNames && results.TableNames.length > 0) {
      return results.TableNames;
    }
  } catch (error) {
    console.log(error);
    throw new Error("Error listing tables");
  }
}

async function createBackup(table: string): Promise<void> {
  const date: Date = new Date();
  const timestamp: string = date.toISOString().substring(0, 10);
  const backupName = `${table}-${timestamp}`;
  const input: CreateBackupCommandInput = {
    BackupName: backupName,
    TableName: table,
  };

  const command: CreateBackupCommand = new CreateBackupCommand(input);

  try {
    await client.send(command);
  } catch (error) {
    console.log(error);
    throw new Error(`Error backing up ${table}`);
  }
}

async function backupAll(tables: string[]) {
  const requests: Promise<any>[] = [];
  try {
    tables.forEach((table) => {
      requests.push(createBackup(table));
    });
    await Promise.all(requests);
  } catch (error) {
    console.log(error);
  }
}
