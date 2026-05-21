export interface TestUser {
  email: string;
  passcode: string;
  counterpartyName: string;
}

export const primaryUser: TestUser = {
  email: 'quinntynebrown@gmail.com',
  passcode: 'CorrectHorseBatteryStaple1!',
  counterpartyName: 'Uncle Ray',
};

export const otherUser: TestUser = {
  email: 'other.user@example.com',
  passcode: 'AnotherStrongPasscode2@',
  counterpartyName: 'Friend',
};
