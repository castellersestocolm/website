from comunicat.enums import Module


class MockGoogleApiClientExecute:
    def __init__(self, *mocked_returns):
        self.mocked_returns = mocked_returns
        self.return_count = 0

    def __call__(self, *args, **kwargs):
        try:
            mocked_return = self.mocked_returns[self.return_count]
            self.return_count += 1

            return mocked_return
        except IndexError:
            return self.mocked_returns[-1]


class MockSumUpApiClientExecute:
    def __init__(self, *mocked_returns):
        self.mocked_returns = mocked_returns
        self.return_count = 0

    def __call__(self, *args, **kwargs):
        try:
            mocked_return = self.mocked_returns[self.return_count]
            self.return_count += 1

            return mocked_return
        except IndexError:
            return self.mocked_returns[-1]


def google_drive_by_module():
    return {
        module: {"drive_id": "google-drive-id", "folder_id": "google-folder-id"}
        for module in Module
    }
