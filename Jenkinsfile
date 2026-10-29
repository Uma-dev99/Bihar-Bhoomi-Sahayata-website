// Bihar Bhoomi Sahayata - Jenkins Declarative Pipeline
//
// Use a "Multibranch Pipeline" job pointed at the GitHub repository.
//   * Pull requests and feature branches: lint, test, build (no deploy).
//   * main: lint, test, build -> deploy to STAGING -> health check
//           -> manual approval -> deploy to PRODUCTION -> health check.
//
// Agent requirements (see docs/JENKINS.md): Python 3.12+, Node 20.19+/22,
// Docker (for a throwaway PostgreSQL used by the backend tests), curl.
//
// Jenkins credentials used (Manage Jenkins -> Credentials), all "Secret text":
//   render-deploy-hook-staging      Render deploy hook URL for the staging API
//   render-deploy-hook-production   Render deploy hook URL for the production API
//   cloudflare-api-token            Cloudflare API token (Pages: Edit only)
//   cloudflare-account-id           Cloudflare account ID
// No secret is ever written to the repository or printed in the log.

pipeline {
  agent any

  options {
    timestamps()
    timeout(time: 45, unit: 'MINUTES')
    disableConcurrentBuilds(abortPrevious: true)
    buildDiscarder(logRotator(numToKeepStr: '30'))
  }

  environment {
    // Public URLs - edit these to your real hostnames.
    STAGING_API_URL      = 'https://bbs-api-staging.onrender.com'
    STAGING_SITE_URL     = 'https://staging.bbs-site.pages.dev'
    PRODUCTION_API_URL   = 'https://bbs-api.onrender.com'
    PRODUCTION_SITE_URL  = 'https://bbs-site.pages.dev'
    PAGES_PROJECT        = 'bbs-site'

    // Throwaway database for tests only (never a real database).
    TEST_DB_CONTAINER    = "bbs-test-db-${env.BUILD_NUMBER}-${env.EXECUTOR_NUMBER}"
    TEST_DB_PORT         = '55432'
  }

  stages {
    stage('Backend: install') {
      steps {
        dir('backend') {
          sh '''
            python3 -m venv .venv
            . .venv/bin/activate
            pip install --quiet --upgrade pip
            pip install --quiet -r requirements.txt pytest pytest-django ruff
          '''
        }
      }
    }

    stage('Backend: lint') {
      steps {
        dir('backend') {
          sh '. .venv/bin/activate && ruff check . && ruff format --check .'
        }
      }
    }

    stage('Backend: test (PostgreSQL)') {
      steps {
        sh '''
          docker run -d --rm --name "$TEST_DB_CONTAINER" \
            -e POSTGRES_USER=bbs -e POSTGRES_PASSWORD=bbs -e POSTGRES_DB=bbs \
            -p "$TEST_DB_PORT:5432" postgres:16-alpine
          for i in $(seq 1 30); do
            docker exec "$TEST_DB_CONTAINER" pg_isready -U bbs >/dev/null 2>&1 && break
            sleep 1
          done
        '''
        dir('backend') {
          withEnv([
            'DJANGO_DEBUG=False',
            'DJANGO_SECRET_KEY=ci-only-not-secret',
            'DJANGO_ALLOWED_HOSTS=localhost,testserver',
            "DATABASE_URL=postgres://bbs:bbs@127.0.0.1:${env.TEST_DB_PORT}/bbs",
            'DATABASE_SSL_REQUIRE=False',
            'DJANGO_SECURE_SSL_REDIRECT=False',
          ]) {
            sh '''
              . .venv/bin/activate
              python manage.py check --deploy --fail-level ERROR
              python manage.py makemigrations --check --dry-run
              pytest --junitxml=test-results.xml
            '''
          }
        }
      }
      post {
        always {
          sh 'docker stop "$TEST_DB_CONTAINER" || true'
          junit allowEmptyResults: true, testResults: 'backend/test-results.xml'
        }
      }
    }

    stage('Frontend: install') {
      steps {
        dir('frontend') {
          sh 'npm ci --no-audit --no-fund'
        }
      }
    }

    stage('Frontend: lint and test') {
      steps {
        dir('frontend') {
          sh 'npm run lint'
          sh 'npm run format:check'
          sh 'npm test -- --reporter=default --reporter=junit --outputFile.junit=test-results.xml'
        }
      }
      post {
        always {
          junit allowEmptyResults: true, testResults: 'frontend/test-results.xml'
        }
      }
    }

    stage('Frontend: build (validation)') {
      when { not { branch 'main' } }
      steps {
        dir('frontend') {
          sh 'VITE_API_BASE_URL="$STAGING_API_URL/api" VITE_SITE_URL="$STAGING_SITE_URL" npm run build'
        }
      }
    }

    stage('Deploy to staging') {
      when { branch 'main' }
      steps {
        withCredentials([string(credentialsId: 'render-deploy-hook-staging', variable: 'HOOK')]) {
          sh 'curl -fsS -X POST "$HOOK" > /dev/null'
        }
        dir('frontend') {
          sh 'VITE_API_BASE_URL="$STAGING_API_URL/api" VITE_SITE_URL="$STAGING_SITE_URL" npm run build'
          withCredentials([
            string(credentialsId: 'cloudflare-api-token', variable: 'CLOUDFLARE_API_TOKEN'),
            string(credentialsId: 'cloudflare-account-id', variable: 'CLOUDFLARE_ACCOUNT_ID'),
          ]) {
            sh 'npx --yes wrangler@4 pages deploy dist --project-name "$PAGES_PROJECT" --branch staging --commit-dirty=true'
          }
        }
        sh 'scripts/health-check.sh "$STAGING_API_URL/api/health/" "$STAGING_SITE_URL/hi/" "$GIT_COMMIT"'
      }
    }

    stage('Approve production') {
      when { branch 'main' }
      steps {
        timeout(time: 3, unit: 'DAYS') {
          input message: "Staging looks right? Check ${env.STAGING_SITE_URL}/hi/ and submit a test enquiry first.",
                ok: 'Deploy to production'
        }
      }
    }

    stage('Deploy to production') {
      when { branch 'main' }
      steps {
        withCredentials([string(credentialsId: 'render-deploy-hook-production', variable: 'HOOK')]) {
          sh 'curl -fsS -X POST "$HOOK" > /dev/null'
        }
        dir('frontend') {
          sh 'rm -rf dist dist-ssr'
          sh 'VITE_API_BASE_URL="$PRODUCTION_API_URL/api" VITE_SITE_URL="$PRODUCTION_SITE_URL" npm run build'
          withCredentials([
            string(credentialsId: 'cloudflare-api-token', variable: 'CLOUDFLARE_API_TOKEN'),
            string(credentialsId: 'cloudflare-account-id', variable: 'CLOUDFLARE_ACCOUNT_ID'),
          ]) {
            sh 'npx --yes wrangler@4 pages deploy dist --project-name "$PAGES_PROJECT" --branch main --commit-dirty=true'
          }
        }
        sh 'scripts/health-check.sh "$PRODUCTION_API_URL/api/health/" "$PRODUCTION_SITE_URL/hi/" "$GIT_COMMIT"'
      }
    }
  }

  post {
    failure {
      echo 'Build failed. If production was affected, follow docs/DEPLOYMENT.md -> "Rollback".'
    }
    cleanup {
      cleanWs(deleteDirs: true, notFailBuild: true)
    }
  }
}
