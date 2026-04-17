module.exports = {
  scan: jest.fn().mockReturnValue({
    promise: jest.fn().mockResolvedValue({
      Items: [
        { id: "p1", name: "iPhone", price: 80000, stock: 5 }
      ]
    })
  }),

  get: jest.fn().mockReturnValue({
    promise: jest.fn().mockResolvedValue({
      Item: { id: "p1", name: "iPhone", price: 80000, stock: 5 }
    })
  }),

  put: jest.fn().mockReturnValue({
    promise: jest.fn().mockResolvedValue({})
  }),

  delete: jest.fn().mockReturnValue({
    promise: jest.fn().mockResolvedValue({})
  })
};