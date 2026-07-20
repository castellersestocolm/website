class MockGoogleApiClientExecute:
    def __init__(self, *mocked_returns):
        self.mocked_returns = mocked_returns
        self.return_count = 0

    def __call__(self, *args, **kwargs):
        try:
            return self.mocked_returns[self.return_count]
        except IndexError:
            return self.mocked_returns[-1]
