import {
  ListBackupsCommand,
  ListBackupsCommandInput,
  DeleteBackupCommand,
  DeleteBackupCommandInput,
  DynamoDBClient,
} from "@aws-sdk/client-dynamodb";

const client: DynamoDBClient = new DynamoDBClient({
  region: process.env.REGION,
});
const daysToRetain = process.env.DAYS_TO_RETAIN;

export async function handler(): Promise<void> {
  const backups = await listAllBackups();
  if (backups) {
    await deleteAllBackups(backups);
  }
}

async function listAllBackups(): Promise<string[]> {
  const date = new Date(); // Current Date
  const newDate = new Date(date.getTime());
  newDate.setDate(date.getDate() - parseInt(daysToRetain)); // Date from past

  const input: ListBackupsCommandInput = {
    BackupType: "ALL",
    TimeRangeUpperBound: newDate,
  };

  const command: ListBackupsCommand = new ListBackupsCommand(input);

  try {
    const results = await client.send(command);
    if (results.BackupSummaries && results.BackupSummaries.length > 0) {
      return results.BackupSummaries.map((table) => {
        return table.BackupArn;
      });
    }
    return null;
  } catch (error) {
    console.log(error);
    throw new Error("Error listing backups");
  }
}

async function deleteBackup(backupArn: string) {
  const input: DeleteBackupCommandInput = {
    BackupArn: backupArn,
  };
  const command: DeleteBackupCommand = new DeleteBackupCommand(input);
  try {
    await client.send(command);
  } catch (error) {
    console.log(error);
    throw new Error(`Could not delete backup ${backupArn}`);
  }
}

async function deleteAllBackups(tableArns: string[]) {
  const requests: Promise<any>[] = [];
  try {
    tableArns.forEach((arn) => {
      requests.push(deleteBackup(arn));
    });
    await Promise.all(requests);
  } catch (error) {
    console.log(error);
  }
}
