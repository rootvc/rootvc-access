import great_expectations as ge

context = ge.data_context.DataContext(
    ge_cloud_mode=True,
    ge_cloud_access_token="a6c65e64fafc48678e86c1f98ee79432",
    ge_cloud_organization_id="23fb3968-f6ab-490c-ae5d-002e5e84f1fc",
    ge_cloud_base_url="https://api.greatexpectations.io/",
)
"""
Please note that you may set the following environment variables instead of passing the above args:
  - GE_CLOUD_BASE_URL
  - GE_CLOUD_ORGANIZATION_ID
  - GE_CLOUD_ACCESS_TOKEN
"""
result = context.run_checkpoint(ge_cloud_id="d7d0d07b-3992-44cf-930c-152173a525ec")
