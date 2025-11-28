/**
 * Environment Variable Validation Utilities
 * 
 * Provides type-safe access to environment variables with validation.
 * Throws clear errors if required variables are missing.
 */

/**
 * Gets a required environment variable
 * @param name - The name of the environment variable
 * @returns The environment variable value
 * @throws Error if the variable is not set
 */
export function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}\n` +
      `Please check your .env.local file or deployment configuration.`
    );
  }
  return value;
}

/**
 * Gets an optional environment variable with a default value
 * @param name - The name of the environment variable
 * @param defaultValue - Default value if variable is not set
 * @returns The environment variable value or default
 */
export function getEnvVarOptional(name: string, defaultValue: string): string {
  return process.env[name] ?? defaultValue;
}

/**
 * Gets a boolean environment variable
 * @param name - The name of the environment variable
 * @param defaultValue - Default value if variable is not set
 * @returns The boolean value
 */
export function getEnvVarBoolean(name: string, defaultValue: boolean = false): boolean {
  const value = process.env[name];
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
}

/**
 * Validates all required Supabase environment variables
 * @throws Error if any required variable is missing
 */
export function validateSupabaseEnv(): void {
  getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
  getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

